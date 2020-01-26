import * as admin from "firebase-admin";

export interface IPayment {
  from_account_id: string;
  to_account_id: string;
  currency: string;
  amount: number;
  commission: number;
  created_at: admin.firestore.Timestamp;
}
