import * as admin from "firebase-admin";
import { account } from "..";
import { Customer } from "./customer";

export const path = "customers";

function ref(accountID: string) {
  return admin
    .firestore()
    .collection(account.path)
    .doc(accountID)
    .collection(path)
    .doc("_");
}

export async function get(accountID: string) {
  return await ref(accountID)
    .get()
    .then(snapshot => snapshot.data() as Customer | undefined);
}

export async function set(accountID: string, data: Customer) {
  await ref(accountID).set(data);
}
