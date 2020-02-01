import * as admin from "firebase-admin";

export interface Transaction {
  from_account_id: string;
  to_account_id: string;
  denom: string;
  total: number;
  fee: number;
  description: string;
  created_at: admin.firestore.Timestamp;
}
