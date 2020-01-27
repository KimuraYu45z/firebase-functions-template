import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { IPayment } from "../types/i-payment";
import { Payment } from ".";

export function chargeFactory<_Payment extends IPayment>(
  paymentFactory: (iPayment: Omit<IPayment, "fee" | "net">) => _Payment
) {
  return functions.https.onCall(
    async (
      data: {
        amount: number;
        currency: string;
        description: string;
        receipt_email: string;
        source: string;
        is_test?: boolean;

        from_account_id: string;
        to_account_id: string;
      },
      context
    ) => {
      try {
        const stripe = Payment.newStripe(!!data.is_test);

        await stripe.charges.create({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          receipt_email: data.receipt_email,
          source: data.source
        });

        const payment = paymentFactory({
          from_account_id: data.from_account_id,
          to_account_id: data.to_account_id,
          currency: data.currency,
          total: data.amount,
          created_at: admin.firestore.Timestamp.now()
        });

        await admin
          .firestore()
          .collection(Payment.path)
          .add(payment);
      } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("unknown", e.toString(), e);
      }
    }
  );
}
