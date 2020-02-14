import * as functions_ from "firebase-functions";
import * as admin_ from "firebase-admin";
import * as internal from "./internal";

export * from "./triggers";

export function initialize(functions: typeof functions_, admin: typeof admin_) {
  const options = {
    credential: admin.credential.cert(
      JSON.parse(
        JSON.stringify(functions.config().service_account).replace(
          /\\\\n/g,
          "\\n",
        ),
      ),
    ),
    databaseURL: functions.config().admin.database_url,
  };
  admin.initializeApp(options);

  internal.initialize(functions, admin);
}
