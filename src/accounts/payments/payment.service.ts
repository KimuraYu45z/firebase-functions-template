import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { Payment } from "./payment";
import { AccountService } from "../account.service";
import { ChargeData } from "./charge-data";

export namespace PaymentService {
  export const path = "payments";

  /**
   *
   */
  export function chargeFactory(callback: (data: ChargeData) => Promise<void>) {
    return functions.https.onCall(async (data: ChargeData, context) => {
      try {
        await AccountService.validateAuth(
          data.account_id,
          context.auth && context.auth.uid
        );

        const stripe = PaymentService.newStripe(!!data.is_test);

        await stripe.charges.create({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          receipt_email: data.receipt_email,
          source: data.source
        });

        const payment: Payment = {
          currency: data.currency,
          amount: data.amount,
          description: data.description,
          created_at: admin.firestore.Timestamp.now()
        };

        await admin
          .firestore()
          .collection(AccountService.path)
          .doc(data.account_id)
          .collection(PaymentService.path)
          .add(payment);

        await callback(data);
      } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("unknown", e.toString(), e);
      }
    });
  }

  export function newStripe(isTest: boolean) {
    const sk = isTest
      ? functions.config()["stripe"]["sk_test"]
      : functions.config()["stripe"]["sk_live"];

    const stripe = new Stripe(sk, {
      apiVersion: "2019-12-03",
      typescript: true
    });

    return stripe;
  }
}
