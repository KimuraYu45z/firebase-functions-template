import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { CustomerService as CustomerService_ } from "./customers/customer.service";
import { SubscriptionService as SubscriptionService_ } from "./subscriptions/subscription.service";
import { IPayment } from "./i-payment";

export namespace PaymentService {
  export const CustomerService = CustomerService_;
  export const SubscriptionService = SubscriptionService_;

  export const path = "payments";

  /**
   * `payments_charge`
   * @param paymentFactory
   */
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
          const stripe = PaymentService.newStripe(!!data.is_test);

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
            .collection(PaymentService.path)
            .add(payment);
        } catch (e) {
          console.error(e);
          throw new functions.https.HttpsError("unknown", e.toString(), e);
        }
      }
    );
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
