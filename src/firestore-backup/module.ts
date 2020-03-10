import * as functions from "firebase-functions";
import * as google from "googleapis";
import { JWT } from "google-auth-library";
import { config } from "../config";

export const export_ = functions.pubsub
  .schedule("00 0 1 * *")
  .onRun(async (context) => {
    const projectID = config.service_account.project_id;

    const firestore = new google.datastore_v1.Datastore({
      auth: new JWT(
        config.service_account.client_email,
        undefined,
        config.service_account.private_key,
        [
          "https://www.googleapis.com/auth/datastore",
          "https://www.googleapis.com/auth/cloud-platform",
        ],
        undefined,
      ),
    });
    const _ = await firestore.projects.export({
      requestBody: {
        entityFilter: { namespaceIds: ["(default)", "exportDocuments"] },
        outputUrlPrefix: `gs://${projectID}-backups-firestore`,
      },
      projectId: projectID,
    });
  });

export const export_bigquery = functions.storage
  .bucket(`${config.service_account.project_id}-backups-firestore`)
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

    const bigquery = new google.bigquery_v2.Bigquery({
      auth: new JWT(
        config.service_account.client_email,
        undefined,
        config.service_account.private_key,
        ["https://www.googleapis.com/auth/bigquery"],
        undefined,
      ),
    });
    const res = await bigquery.jobs.insert({
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
            sourceUris: [`gs://${projectID}-backups-firestore/${name}`],
          },
        },
      },
    });

    return true;
  });
