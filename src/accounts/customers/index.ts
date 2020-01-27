import * as admin from "firebase-admin";
import { Account } from "..";
import { Customer as _Customer } from "../../types/customer";
export const path = "customers";

export namespace Customer {
  function ref(accountID: string) {
    return admin
      .firestore()
      .collection(Account.path)
      .doc(accountID)
      .collection(path)
      .doc("customer");
  }

  export async function get(accountID: string) {
    return await ref(accountID)
      .get()
      .then(snapshot => snapshot.data() as _Customer | undefined);
  }

  export async function set(accountID: string, data: _Customer) {
    await ref(accountID).set(data);
  }
}
