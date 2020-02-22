import * as functions from "firebase-functions";
import { IAccount } from "./i-account.model";
import { account } from ".";
import { user } from "../users";
import { admin } from "../internal";
import { auth } from "firebase-admin";

export const collectionPath = "accounts";
export const documentPath = "account_id";

export async function get(accountID: string) {
  return await admin
    .firestore()
    .collection(collectionPath)
    .doc(accountID)
    .get()
    .then((snapshot) => snapshot.data() as IAccount);
}

export async function update(
  accountID: string,
  data: Partial<Omit<IAccount, "updated_at">>,
) {
  await admin
    .firestore()
    .collection(collectionPath)
    .doc(accountID)
    .update({ ...data, updated_at: admin.firestore.Timestamp.now() });
}

/**
 *
 * @param accountID
 * @param userID
 * @param isAdmin
 */
export async function validateAuth(
  accountID: string,
  userID?: string,
  isAdmin?: boolean,
) {
  if (!userID) {
    throw new functions.https.HttpsError("unauthenticated", "unauthenticated");
  }
  const account = await get(accountID);

  if (isAdmin) {
    if (!account.admin_user_ids.find((userID_) => userID_ === userID)) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "user is not in account",
      );
    }
    return;
  }

  if (!account.user_ids.find((userID_) => userID_ === userID)) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "user is not in account",
    );
  }
}

/**
 * `account_get_users`
 */
export const getUsers = functions.https.onCall(
  async (
    data: {
      account_id: string;
    },
    context,
  ) => {
    try {
      await account.validateAuth(
        data.account_id,
        context.auth && context.auth.uid,
      );

      const account_ = await get(data.account_id);

      const users: auth.UserRecord[] = [];
      for (const userID of account_.user_ids) {
        users.push(await admin.auth().getUser(userID));
      }

      return users;
    } catch (e) {
      if (e instanceof functions.https.HttpsError) {
        throw e;
      }
      console.error(e);
      throw new functions.https.HttpsError("unknown", e.toString(), e);
    }
  },
);

/**
 * `account_remove_user`
 */
export const removeUser = functions.https.onCall(
  async (
    data: {
      account_id: string;
      user_id: string;
    },
    context,
  ) => {
    try {
      await account.validateAuth(
        data.account_id,
        context.auth && context.auth.uid,
        true,
      );

      await account.update(data.account_id, {
        user_ids: admin.firestore.FieldValue.arrayRemove(data.user_id) as any,
        admin_user_ids: admin.firestore.FieldValue.arrayRemove(
          data.user_id,
        ) as any,
      });

      await user.update(data.user_id, {
        account_ids_order: admin.firestore.FieldValue.arrayRemove(
          data.account_id,
        ) as any,
      });
    } catch (e) {
      if (e instanceof functions.https.HttpsError) {
        throw e;
      }
      console.error(e);
      throw new functions.https.HttpsError("unknown", e.toString(), e);
    }
  },
);
