import * as admin from "firebase-admin";

export interface IUser {
  selected_account_id: string;
  account_ids_order: string[];
  updated_at: admin.firestore.Timestamp;

  is_admin?: boolean;
}
