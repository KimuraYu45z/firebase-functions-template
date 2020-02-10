import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FirestoreTriggerHandler } from "./firestore-trigger-handler";

export const collectionPath = "triggers";

export async function handleHandlers(
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext,
  handlers: FirestoreTriggerHandler[],
) {
  for (const handler of handlers) {
    try {
      await handler(snapshot, context);
    } catch (e) {
      console.error(e);
    }
  }
}

export async function isAlready(eventID: string) {
  return await admin.firestore().runTransaction(async (t) => {
    const ref = admin
      .firestore()
      .collection(collectionPath)
      .doc(eventID);

    const doc = await t.get(ref);
    if (doc.exists) {
      return true;
    }
    t.set(ref, {});
    return false;
  });
}
