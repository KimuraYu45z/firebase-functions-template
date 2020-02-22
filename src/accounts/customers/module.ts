import { account } from "..";
import { Customer } from "./customer.model";
import { admin } from "../../internal";

export const collectionPath = "customers";
export const documentID = "customer";

function ref(accountID: string) {
  return admin
    .firestore()
    .collection(account.collectionPath)
    .doc(accountID)
    .collection(collectionPath)
    .doc(documentID);
}

export async function get(accountID: string) {
  return await ref(accountID)
    .get()
    .then((snapshot) => snapshot.data() as Customer | undefined);
}

export async function set(accountID: string, data: Customer) {
  await ref(accountID).set(data);
}
