import * as functions from "firebase-functions";
import { Stripe } from "stripe";
import { Customer as Customer_ } from "./customers";
import { Subscription as Subscription_ } from "./subscriptions";

export namespace Payment {
  export const Customer = Customer_;
  export const Subscription = Subscription_;

  export const path = "payments";

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
