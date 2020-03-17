import * as functions from "firebase-functions";

import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { config } from "../config";

export async function export_() {
  const projectID = config.service_account.project_id;
  const date = new Date();
  const monthString = ("00" + (date.getMonth() + 1)).slice(-2);
  const dateString = ("00" + date.getDate()).slice(-2);
  const name = `${date.getFullYear()}${monthString}${dateString}`;

  const firestore = google.firestore({
    version: "v1",
    auth: new JWT(
      config.service_account.client_email,
      undefined,
      config.service_account.private_key.replace(/\\n/g, "\n"),
      [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/cloud-platform",
      ],
      undefined,
    ),
  });
  await firestore.projects.databases.exportDocuments({
    name: `projects/${projectID}/databases/(default)`,
    requestBody: {
      outputUriPrefix: `gs://${projectID}.appspot.com/firestore_backup/${name}`,
    },
  });
}

export const import_ = functions.https.onRequest(async (req, res) => {
  const inputURL = req.query["input_url"];
  if (!inputURL) {
    throw Error("input_url is required");
  }
  const projectID = config.service_account.project_id;

  const firestore = google.firestore({
    version: "v1",
    auth: new JWT(
      config.service_account.client_email,
      undefined,
      config.service_account.private_key.replace(/\\n/g, "\n"),
      [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/cloud-platform",
      ],
      undefined,
    ),
  });
  await firestore.projects.databases.importDocuments({
    name: `projects/${projectID}/databases/(default)`,
    requestBody: {
      inputUriPrefix: inputURL,
    },
  });
});
