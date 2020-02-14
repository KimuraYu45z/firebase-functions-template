import { functions } from "./internal";

export const config = functions.config() as {
  algolia: {
    app_id: string;
    admin_api_key: string;
  };
  stripe: {
    sk_test: string;
    sk_live: string;
  };
};
