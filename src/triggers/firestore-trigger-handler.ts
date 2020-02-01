import * as functions from "firebase-functions";

export type FirestoreTriggerHandler = (
  snapshot: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
) => Promise<void>;
