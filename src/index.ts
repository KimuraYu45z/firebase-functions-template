import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export * from "./triggers";

export function initialize(
  initializeApp: (options: {
    credential: admin.credential.Credential;
    databaseURL: string;
  }) => admin.app.App,
) {
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
  initializeApp(options);
  admin.initializeApp(options);
}
