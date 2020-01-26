import * as admin from "firebase-admin";

export interface IAccount {
  user_ids: string[];
  image_url: string;
  created_at: admin.firestore.Timestamp;
  updated_at: admin.firestore.Timestamp;
  selected_at: admin.firestore.Timestamp;

  _id?: string;
}
