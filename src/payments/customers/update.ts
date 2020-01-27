import * as functions from "firebase-functions";
import { newStripe } from "../stripe";
import { Account } from "../../accounts";
import { Stripe } from "stripe";

export const update = functions.https.onCall(
  async (
    data: {
      account_id: string;
      email?: string;
      source?: string;
      is_test?: boolean;
    },
    context
  ) => {
    try {
      if (
        await Account.validateAuth(
          data.account_id,
          context.auth && context.auth.uid
        )
      ) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "unauthenticated"
        );
      }

      const stripe = newStripe(!!data.is_test);

      const customer = await Account.Customer.get(data.account_id);

      if (!customer) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "customer id undefined"
        );
      }

      const params: Stripe.CustomerUpdateParams = {};
      if (data.email) {
        params.email = data.email;
      }
      if (data.source) {
        params.source = data.source;
      }
      await stripe.customers.update(customer.customer_id, params);

      await Account.Customer.set(data.account_id, {
        customer_id: customer.customer_id,
        subscription_ids: customer.subscription_ids
      });
    } catch (e) {
      if (e instanceof functions.https.HttpsError) {
        throw e;
      }
      console.error(e);
      throw new functions.https.HttpsError("unknown", e.toString(), e);
    }
  }
);
