import * as functions from "firebase-functions";
import { FirestoreTriggerHandler } from "../types/firestore-trigger-handler";

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
