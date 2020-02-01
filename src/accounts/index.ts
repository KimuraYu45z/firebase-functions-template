import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { IAccount } from "./i-account";

export namespace AccountService {
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
        if (
          await AccountService.validateAuth(
            data.account_id,
            context.auth && context.auth.uid
          )
        ) {
          throw new functions.https.HttpsError(
            "unauthenticated",
            "unauthenticated"
          );
        }

        const account = await admin
          .firestore()
          .collection("accounts")
          .doc(data.account_id)
          .get()
          .then(snapshot => snapshot.data() as IAccount);

        const users: admin.auth.UserRecord[] = [];
        for (const userID of account.user_ids) {
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
      return false;
    }
    const account = await admin
      .firestore()
      .collection("accounts")
      .doc(accountID)
      .get()
      .then(snapshot => snapshot.data() as IAccount);

    return !!account.user_ids.find(_userID => _userID === userID);
  }
}
