import * as admin from "firebase-admin";
import { IAccount } from "../types/i-account";

export * from "./customers";
export const path = "accounts";

export async function getUsers() {}

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
