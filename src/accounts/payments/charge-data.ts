export interface ChargeData {
  account_id: string;
  amount: number;
  currency: string;
  description: string;
  receipt_email: string;
  source: string;
  is_test?: boolean;
}
