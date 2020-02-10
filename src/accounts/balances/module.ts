import * as admin from "firebase-admin";
import { account } from "..";

export const collectionPath = "balances";
export const documentID = "balance";

export function ref(accountID: string) {
  return admin
    .firestore()
    .collection(account.collectionPath)
    .doc(accountID)
    .collection(collectionPath)
    .doc(documentID);
}
