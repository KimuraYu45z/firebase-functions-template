import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { account } from "../..";
import { payment as account_payment } from "..";
import { customer as account_customer } from "../../customers";

export const create = functions.https.onCall(
  async (
    data: {
      account_id: string;
      email: string;
      source: string;
      is_test?: boolean;
    },
    context,
  ) => {
    try {
      await account.validateAuth(
        data.account_id,
        context.auth && context.auth.uid,
      );

      const stripe = account_payment.newStripe(!!data.is_test);

      const customer_ = await stripe.customers.create({
        email: data.email,
        source: data.source,
      });

      await account_customer.set(data.account_id, {
        customer_id: customer_.id,
        subscription_ids: {},
      });
    } catch (e) {
      if (e instanceof functions.https.HttpsError) {
        throw e;
      }
      console.error(e);
      throw new functions.https.HttpsError("unknown", e.toString(), e);
    }
  },
);

export const update = functions.https.onCall(
  async (
    data: {
      account_id: string;
      email?: string;
      source?: string;
      is_test?: boolean;
    },
    context,
  ) => {
    try {
      await account.validateAuth(
        data.account_id,
        context.auth && context.auth.uid,
      );

      const stripe = account_payment.newStripe(!!data.is_test);

      const customer = await account_customer.get(data.account_id);

      if (!customer) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "customer id undefined",
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

      await account_customer.set(data.account_id, {
        customer_id: customer.customer_id,
        subscription_ids: customer.subscription_ids,
      });
    } catch (e) {
      if (e instanceof functions.https.HttpsError) {
        throw e;
      }
      console.error(e);
      throw new functions.https.HttpsError("unknown", e.toString(), e);
    }
  },
);
