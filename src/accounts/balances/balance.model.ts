export type Balance = {
  [denom: string]: {
    amount: number;
    total: number;
  };
};
