export interface Balance {
  [denom: string]: {
    amount: number;
    total: number;
  };
}
