import * as functions from "firebase-functions";
import algoliasearch_ from "algoliasearch";
const algoliasearch = algoliasearch_;

export namespace AlgoliaService {
  export async function set(indexName: string, id: string, data: any) {
    const obj = {
      objectID: id,
      ...data
    };
    const client = algoliasearch(
      functions.config()["algolia"]["app_id"],
      functions.config()["algolia"]["admin_api_key"]
    );
    const index = client.initIndex(indexName);
    await index.saveObject(obj);
  }

  export async function delete_(indexName: string, id: string) {
    const client = algoliasearch(
      functions.config()["algolia"]["app_id"],
      functions.config()["algolia"]["admin_api_key"]
    );
    const index = client.initIndex(indexName);
    await index.deleteObject(id);
  }
}
