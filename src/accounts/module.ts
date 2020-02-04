import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { IAccount } from "./i-account";
import { account } from ".";
import { balance } from "./balances";
import { customer } from "./customers";
import { payment } from "./payments";

export { balance };
export { customer };
export { payment };

export const path = "accounts";

/**
 * `accounts_get_users`
 */
export const getUsers = functions.https.onCall(
  async (
    data: {
      account_id: string;
    },
    context
  ) => {
    try {
      await account.validateAuth(
        data.account_id,
        context.auth && context.auth.uid
      );

      const account_ = await admin
        .firestore()
        .collection("accounts")
        .doc(data.account_id)
        .get()
        .then(snapshot => snapshot.data() as IAccount);

      const users: admin.auth.UserRecord[] = [];
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
  }
);

export async function validateAuth(accountID: string, userID?: string) {
  if (!userID) {
    throw new functions.https.HttpsError("unauthenticated", "unauthenticated");
  }
  const account = await admin
    .firestore()
    .collection("accounts")
    .doc(accountID)
    .get()
    .then(snapshot => snapshot.data() as IAccount);

  if (!account.user_ids.find(_userID => _userID === userID)) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "user is not in account"
    );
  }
}
