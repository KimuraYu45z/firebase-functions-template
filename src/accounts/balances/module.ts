import { account } from "..";
import { admin } from "../../internal";

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
