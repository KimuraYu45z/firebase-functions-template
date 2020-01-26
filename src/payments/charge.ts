import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Stripe } from "stripe";
import { IPayment } from "../types/i-payment";
import { path } from "./path";

export function chargeFactory<Payment extends IPayment>(
  paymentFactory: (iPayment: IPayment) => Payment
) {
  return functions.https.onRequest(async (req, res) => {
    try {
      const amount: number = Number(req.body["amount"]);
      const currency: string = req.body["currency"];
      const description: string = req.body["description"];
      const email: string = req.body["email"];
      const token: string = req.body["token"];

      const isTest: boolean = Boolean(req.body["is_test"]);
      const sk = isTest
        ? functions.config()["stripe"]["sk_test"]
        : functions.config()["stripe"]["sk_test"];

      const stripe = new Stripe(sk, {
        apiVersion: "2019-12-03",
        typescript: true
      });
      const charge = await stripe.charges.create({
        amount: amount,
        currency: currency,
        description: description,
        receipt_email: email,
        source: token
      });

      const fromAccountID: string = req.body["from_account_id"];
      const toAccountID: string = req.body["to_account_id"];
      const commission: number = Number(req.body["commission"]);

      const iPayment: IPayment = {
        from_account_id: fromAccountID,
        to_account_id: toAccountID,
        currency: currency,
        amount: amount,
        commission: commission,
        created_at: admin.firestore.Timestamp.now()
      };
      const payment = paymentFactory(iPayment);

      await admin
        .firestore()
        .collection(path)
        .add(payment);

      res.status(200).send(charge);
    } catch (e) {
      console.error(e);
      res.status(400).send(e.message);
    }
  });
}
