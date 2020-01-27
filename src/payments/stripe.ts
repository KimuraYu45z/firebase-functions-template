import * as functions from "firebase-functions";
import { Stripe } from "stripe";

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
