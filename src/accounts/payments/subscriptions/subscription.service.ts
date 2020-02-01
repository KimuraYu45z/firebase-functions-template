import * as functions from "firebase-functions";
import { AccountService } from "../../account.service";
import { PaymentService } from "../payment.service";
import { CustomerService } from "../../customers/customer.service";

export namespace SubscriptionService {
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
        await AccountService.validateAuth(
          data.account_id,
          context.auth && context.auth.uid
        );

        const customer = await CustomerService.get(data.account_id);

        if (!customer) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "customer id undefined"
          );
        }

        const stripe = PaymentService.newStripe(!!data.is_test);

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

  export const delete_ = functions.https.onCall(
    async (
      data: {
        account_id: string;
        plan_id: string;
        is_test?: boolean;
      },
      context
    ) => {
      try {
        await AccountService.validateAuth(
          data.account_id,
          context.auth && context.auth.uid
        );

        const customer = await CustomerService.get(data.account_id);

        if (!customer) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "customer id undefined"
          );
        }

        const subscriptionID: string | undefined =
          customer.subscription_ids[data.plan_id];
        if (!subscriptionID) {
          throw new functions.https.HttpsError(
            "resource-exhausted",
            "subscription id undefined"
          );
        }

        const stripe = PaymentService.newStripe(!!data.is_test);

        await stripe.subscriptions.del(subscriptionID);

        delete customer.subscription_ids[data.plan_id];
        await CustomerService.set(data.account_id, customer);
      } catch (e) {
        if (e instanceof functions.https.HttpsError) {
          throw e;
        }
        console.error(e);
        throw new functions.https.HttpsError("unknown", e.toString(), e);
      }
    }
  );
}
