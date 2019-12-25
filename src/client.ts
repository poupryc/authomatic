import { Client, custom, Issuer } from "openid-client";
import ow from "ow";

import { Setting } from "./instance";

export interface ClientSetting {
  /**
   * Timeout (in milliseconds) for HTTP requests to Auth0
   */
  httpTimeout?: number;
  /**
   * Allowed leeway for id_tokens (in milliseconds)
   */
  clockTolerance?: number;
}

/**
 * Shortcut to the return type of the `createClient` function
 */
export type ClientFactory = ReturnType<typeof createClient>;

/**
 * Shape of the expected cookie's configuration object
 */
export const clientPredicate = ow.optional.object.exactShape({
  httpTimeout: ow.optional.number,
  clockTolerance: ow.optional.number
});

/**
 * Default Client's setting
 */
export const clientDefault = {
  httpTimeout: 2500
};

/**
 * Create oidc client
 * @param setting module settings
 */
export function createClient(setting: Required<Setting>) {
  let client: Client;

  return async () => {
    const { clockTolerance, httpTimeout } = setting.client;

    const issuer = await Issuer.discover(`https://${setting.domain}/`);
    client = new issuer.Client({
      client_id: setting.clientId,
      client_secret: setting.clientSecret,
      redirect_uris: [setting.postLoginRedirect],
      response_types: ["code"]
    });

    if (httpTimeout) {
      client[custom.http_options] = options => {
        options.timeout = httpTimeout;
        return options;
      };
    }

    if (clockTolerance) {
      client[custom.clock_tolerance] = clockTolerance / 1000;
    }

    return client;
  };
}
