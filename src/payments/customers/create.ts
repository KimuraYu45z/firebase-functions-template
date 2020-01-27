import * as functions from "firebase-functions";
import { Payment } from "..";
import { Account } from "../../accounts";

export const create = functions.https.onCall(
  async (
    data: {
      account_id: string;
      email: string;
      source: string;
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

      const stripe = Payment.newStripe(!!data.is_test);

      const customer = await stripe.customers.create({
        email: data.email,
        source: data.source
      });

      await Account.Customer.set(data.account_id, {
        customer_id: customer.id,
        subscription_ids: {}
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
