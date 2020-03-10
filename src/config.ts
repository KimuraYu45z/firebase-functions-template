import { functions } from "./internal";

export const config = functions.config() as {
  service_account: {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  algolia: {
    app_id: string;
    admin_api_key: string;
  };
  stripe: {
    sk_test: string;
    sk_live: string;
  };
};
