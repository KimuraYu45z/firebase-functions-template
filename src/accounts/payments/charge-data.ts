export type ChargeData = {
  account_id: string;
  amount: number;
  currency: string;
  description: string;
  source: string;
  is_test?: boolean;
};
