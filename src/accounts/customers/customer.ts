export interface Customer {
  customer_id: string;
  subscription_ids: { [plan_id: string]: string };
}
