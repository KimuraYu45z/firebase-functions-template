import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { Payment } from "./payment.model";
import { account } from "..";
import { ChargeData } from "./charge-data";

import { config } from "../../config";
import { admin } from "../../internal";
import { private_ as account_private } from "../privates";

export const collectionPath = "payments";
export const documentPath = "payment_id";

/**
 *
 */
export function chargeFactory<T>(
  createChargeData: (
    data: T & { charge_data: { source: string; is_test?: boolean } },
  ) => Promise<ChargeData>,
  callback: (data: T & { charge_data: ChargeData }) => Promise<void>,
) {
  return functions.https.onCall(
    async (
      data: T & { charge_data: { source: string; is_test?: boolean } },
      context,
    ) => {
      try {
        const chargeData = await createChargeData(data);

        await account.validateAuth(
          chargeData.account_id,
          context.auth && context.auth.uid,
        );

        const private_ = await account_private.get(chargeData.account_id);

        const stripe = newStripe(!!data.charge_data.is_test);

        await stripe.charges.create({
          amount: chargeData.amount,
          currency: chargeData.currency,
          description: chargeData.description,
          receipt_email: private_.email,
          source: chargeData.source,
        });

        const payment: Payment = {
          currency: chargeData.currency,
          amount: chargeData.amount,
          description: chargeData.description,
          created_at: admin.firestore.Timestamp.now(),
        };

        await admin
          .firestore()
          .collection(account.collectionPath)
          .doc(chargeData.account_id)
          .collection(collectionPath)
          .add(payment);

        await callback({ ...data, charge_data: chargeData });
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
