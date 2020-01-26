import * as admin from "firebase-admin";

export interface I_Account {
  admin_user_ids: string[];
  updated_at: admin.firestore.Timestamp;

  _id?: string;
}
