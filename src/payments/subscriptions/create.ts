import * as functions from "firebase-functions";
import { newStripe } from "../stripe";
import { Account } from "../../accounts";

export const create = functions.https.onCall(
  async (
    data: {
      account_id: string;
      plan_id: string;
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

      const customer = await Account.Customer.get(data.account_id);

      if (!customer) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "customer id undefined"
        );
      }

      const stripe = newStripe(!!data.is_test);

      await stripe.subscriptions.create({
        customer: customer.customer_id,
        items: [{ plan: data.plan_id }]
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
