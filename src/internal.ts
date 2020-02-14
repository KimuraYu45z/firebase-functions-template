import * as functions_ from "firebase-functions";
import * as admin_ from "firebase-admin";

export let functions: typeof functions_;
export let admin: typeof admin_;

export function initialize(
  functions__: typeof functions_,
  admin__: typeof admin_,
) {
  functions = functions__;
  admin = admin__;
}
