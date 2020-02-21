import * as admin from "firebase-admin";
import { IPrivate } from "./i-private";
import { account } from "..";

export const collectionPath = "privates";
export const documentID = "private";

export async function get(accountID: string) {
  return await admin
    .firestore()
    .collection(account.collectionPath)
    .doc(accountID)
    .collection(collectionPath)
    .doc(documentID)
    .get()
    .then((snapshot) => snapshot.data() as IPrivate);
}
