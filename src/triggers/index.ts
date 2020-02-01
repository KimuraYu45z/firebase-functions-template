import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FirestoreTriggerHandler } from "../types/firestore-trigger-handler";

export namespace TriggerService {
  export const path = "triggers";

  export function handleHandlers(
    snapshot: FirebaseFirestore.DocumentSnapshot,
    context: functions.EventContext,
    handlers: FirestoreTriggerHandler[]
  ) {
    for (const handler of handlers) {
      try {
        handler(snapshot, context);
      } catch (e) {
        console.error(e);
      }
    }
  }

  export async function isAlready(eventID: string) {
    return await admin.firestore().runTransaction(async t => {
      const ref = admin
        .firestore()
        .collection(path)
        .doc(eventID);

      const doc = await t.get(ref);
      if (doc.exists) {
        return true;
      }
      t.set(ref, {});
      return false;
    });
  }
}
