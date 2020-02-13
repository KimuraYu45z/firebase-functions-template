import * as admin from "firebase-admin";
import { IUser } from "./i-user";

export const collectionPath = "users";
export const documentPath = "user_id";

export async function update(
  userID: string,
  data: Partial<Omit<IUser, "updated_at">>,
) {
  await admin
    .firestore()
    .collection(collectionPath)
    .doc(userID)
    .update({ ...data, update_at: admin.firestore.Timestamp.now });
}
