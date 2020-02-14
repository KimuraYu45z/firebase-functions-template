import * as functions from "firebase-functions";
import { Transaction } from "./transaction";
import { balance as account_balance } from "../accounts/balances";
import { admin } from "../internal";

export const collectionPath = "transactions";
export const documentPath = "transaction_id";

export const onCreate = functions.firestore
  .document(`${collectionPath}/{${documentPath}}`)
  .onCreate(async (snapshot, context) => {
    const transaction: Transaction = snapshot.data() as Transaction;

    await admin.firestore().runTransaction(async (t) => {
      if (transaction.from_account_id) {
        t.update(account_balance.ref(transaction.from_account_id), {
          [`${transaction.denom}.amount`]: admin.firestore.FieldValue.increment(
            -transaction.total,
          ),
        });
      }

      if (transaction.to_account_id) {
        const net = transaction.total - transaction.fee;
        t.update(account_balance.ref(transaction.from_account_id), {
          [`${transaction.denom}.amount`]: admin.firestore.FieldValue.increment(
            net,
          ),
          [`${transaction.denom}.total`]: admin.firestore.FieldValue.increment(
            net,
          ),
        });
      }
    });
  });
