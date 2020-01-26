import * as admin from "firebase-admin";
import { path } from './path';

export async function isTriggeredOnce(eventID: string) {
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
