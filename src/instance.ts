import ow from "ow";
import {
  clientDefault,
  clientPredicate,
  ClientSetting,
  createClient
} from "./client";
import { cookieDefault, cookiePredicate, CookieSetting } from "./cookie";
import { SessionStore } from "./session";
import handlers from "./handlers";

export interface Setting {
  /**
   * Auth0 domain
   */
  domain: string;

  /**
   * Auth0 client ID
   */
  clientId: string;

  /**
   * Auth0 client secret
   */
  clientSecret: string;

  /**
   * Default url to redirect to after the user has signed in
   */
  postLoginRedirect: string;

  /**
   * Default url to redirect to after the user has signed out
   */
  postLogoutRedirect: string;

  /**
   * The scope requested by the client
   */
  scope: string;

  /**
   * API Audience
   */
  audience?: string;

  /**
   * Settings related to the session's cookie
   */
  cookie: CookieSetting;

  /**
   * Settings related to the OIDC Client
   */
  client?: ClientSetting;
}

/**
 * Shortcut for the return type of the `createClient` function
 */
export type ClientFactory = ReturnType<typeof createClient>;

/**
 * Shape of the expected configuration object
 */
const settingPredicate = ow.object.exactShape({
  domain: ow.string.nonEmpty,
  clientId: ow.string.nonEmpty,
  clientSecret: ow.string.nonEmpty,
  postLogoutRedirect: ow.string.url,
  postLoginRedirect: ow.string.url,
  scope: ow.string.nonEmpty,
  audience: ow.optional.string.url,
  cookie: cookiePredicate,
  client: clientPredicate
});

/**
 * Creates an instance of the module to use the different handlers
 * @param setting module settings
 */
export function createInstance(setting: Setting) {
  ow(setting, "setting object", settingPredicate);

  // Default options are provided to be able
  // to mark the type of setting as `Required`
  setting.cookie = { ...cookieDefault, ...setting.cookie };
  setting.client = { ...clientDefault, ...setting.client };

  const client = createClient(setting as Required<Setting>);
  const store = new SessionStore(setting.cookie as Required<CookieSetting>);

  return {
    handleLogin: handlers.handleLogin(setting, client),
    handleLogout: handlers.handleLogout(setting),
    handleCallback: handlers.handleCallback(setting, client, store),
    handleProfile: handlers.handleProfile(store)
  };
}
