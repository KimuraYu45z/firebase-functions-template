import * as admin from "firebase-admin";

export interface IPayment {
  from_account_id: string;
  to_account_id: string;
  currency: string;
  total: number;
  fee: number;
  net: number;
  created_at: admin.firestore.Timestamp;
}
