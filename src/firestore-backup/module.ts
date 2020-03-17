import * as functions from "firebase-functions";

import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { config } from "../config";

export async function export_(namespaceIDs?: string[]) {
  const projectID = config.service_account.project_id;

  const firestore = google.datastore({
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
  await firestore.projects.export({
    requestBody: {
      outputUrlPrefix: `gs://${projectID}.appspot.com/firestore_backup`,
    },
    projectId: projectID,
  });

  await firestore.projects.export({
    requestBody: {
      entityFilter: {
        namespaceIds: namespaceIDs,
      },
      outputUrlPrefix: `gs://${projectID}.appspot.com`,
    },
    projectId: projectID,
  });
}

export const export_bigquery = functions.storage
  .bucket(`${config.service_account.project_id}.appspot.com`)
  .object()
  .onFinalize(async (object) => {
    // 作成されたオブジェクト名
    const name = object.name!;
    // 正規表現でFirestoreドキュメントのエクスポートが終わった時に作成されるmetadataかどうかチェック
    const matched = name.match(/all_namespaces_kind_(.+)\.export_metadata/);
    if (!matched) {
      return false;
    }

    const collectionName = matched[1];

    const projectID = config.service_account.project_id;

    const bigquery = google.bigquery({
      version: "v2",
      auth: new JWT(
        config.service_account.client_email,
        undefined,
        config.service_account.private_key.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/bigquery"],
        undefined,
      ),
    });
    await bigquery.jobs.insert({
      requestBody: {
        configuration: {
          load: {
            destinationTable: {
              tableId: collectionName,
              datasetId: "firestore",
              projectId: projectID,
            },
            sourceFormat: "DATASTORE_BACKUP",
            writeDisposition: "WRITE_TRUNCATE",
            sourceUris: [`gs://${projectID}.appspot.com/${name}`],
          },
        },
      },
    });

    return true;
  });

export const import_ = functions.https.onRequest(async (req, res) => {
  const inputURL = req.query["input_url"];
  if (!inputURL) {
    throw Error("input_url is required");
  }
  const projectID = config.service_account.project_id;

  const firestore = new google.datastore_v1.Datastore({
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
  await firestore.projects.import({
    requestBody: {
      inputUrl: inputURL,
    },
    projectId: projectID,
  });
});
