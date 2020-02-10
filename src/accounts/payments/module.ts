import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { Payment } from "./payment";
import { account } from "..";
import { ChargeData } from "./charge-data";

import { config } from "../../config";

export const collectionPath = "payments";
export const documentPath = "payment_id";

/**
 *
 */
export function chargeFactory<T>(
  validate: (data: T & { charge_data: ChargeData }) => Promise<void>,
  callback: (data: T & { charge_data: ChargeData }) => Promise<void>,
) {
  return functions.https.onCall(
    async (data: T & { charge_data: ChargeData }, context) => {
      try {
        await account.validateAuth(
          data.charge_data.account_id,
          context.auth && context.auth.uid,
        );

        await validate(data);

        const stripe = newStripe(!!data.charge_data.is_test);

        await stripe.charges.create({
          amount: data.charge_data.amount,
          currency: data.charge_data.currency,
          description: data.charge_data.description,
          receipt_email: data.charge_data.receipt_email,
          source: data.charge_data.source,
        });

        const payment: Payment = {
          currency: data.charge_data.currency,
          amount: data.charge_data.amount,
          description: data.charge_data.description,
          created_at: admin.firestore.Timestamp.now(),
        };

        await admin
          .firestore()
          .collection(account.collectionPath)
          .doc(data.charge_data.account_id)
          .collection(collectionPath)
          .add(payment);

        await callback(data);
      } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("unknown", e.toString(), e);
      }
    },
  );
}

export function newStripe(isTest: boolean) {
  const sk = isTest ? config.stripe.sk_test : config.stripe.sk_live;

  const stripe = new Stripe(sk, {
    apiVersion: "2019-12-03",
    typescript: true,
  });

  return stripe;
}
