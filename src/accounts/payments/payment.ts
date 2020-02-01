import * as admin from "firebase-admin";

export interface Payment {
  currency: string;
  amount: number;
  description: string;
  created_at: admin.firestore.Timestamp;
}
