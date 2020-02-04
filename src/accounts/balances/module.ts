import * as admin from "firebase-admin";
import { FirestoreTriggerHandler } from "../../triggers";
import { Transaction } from "../../transactions/transaction";
import { account } from "..";

export const path = "balances";
export const onTransactionCreateHandler: FirestoreTriggerHandler = async (
  snapshot,
  context
) => {
  const transaction: Transaction = snapshot.data() as Transaction;

  await admin.firestore().runTransaction(async t => {
    if (transaction.from_account_id) {
      t.update(
        admin
          .firestore()
          .collection(account.path)
          .doc(transaction.from_account_id)
          .collection(account.balance.path)
          .doc("_"),
        {
          [`${transaction.denom}.amount`]: admin.firestore.FieldValue.increment(
            -transaction.total
          )
        }
      );
    }

    if (transaction.to_account_id) {
      const net = transaction.total - transaction.fee;
      t.update(
        admin
          .firestore()
          .collection(account.path)
          .doc(transaction.from_account_id)
          .collection(account.balance.path)
          .doc("_"),
        {
          [`${transaction.denom}.amount`]: admin.firestore.FieldValue.increment(
            net
          ),
          [`${transaction.denom}.total`]: admin.firestore.FieldValue.increment(
            net
          )
        }
      );
    }
  });
};
