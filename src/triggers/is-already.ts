import * as admin from "firebase-admin";
import { Trigger } from ".";

export async function isAlready(eventID: string) {
  return await admin.firestore().runTransaction(async t => {
    const ref = admin
      .firestore()
      .collection(Trigger.path)
      .doc(eventID);

    const doc = await t.get(ref);
    if (doc.exists) {
      return true;
    }
    t.set(ref, {});
    return false;
  });
}
