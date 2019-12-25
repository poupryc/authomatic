import { ClientFactory } from "../client";
import { Setting } from "../instance";
import { ServerOption } from ".";
import { setCookie } from "../cookie";
import { generators } from "openid-client";

export interface LoginOption {
  /**
   * Context class that the Authorization Server is being requested
   * to use when processing requests from the application
   */
  acr_values?: string;

  /**
   * The default audience to be used for requesting API access
   */
  audience?: string;

  /**
   * - `'page'`: displays the UI with a full page view
   * - `'popup'`: displays the UI with a popup window
   * - `'touch'`: displays the UI in a way that leverages a touch interface
   * - `'wap'`: displays the UI with a "feature phone" type interface
   */
  display?: "page" | "popup" | "touch" | "wap";

  /**
   * The user's email address or other identifier. When your app knows
   * which user is trying to authenticate, you can provide this parameter
   * to pre-fill the email box or select the right session for sign-in
   */
  login_hint?: string;

  /**
   * Maximum allowable elasped time (in seconds) since authentication
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated
   */
  max_age?: string;

  /**
   * - `'none'`: do not prompt user for login or consent on reauthentication
   * - `'login'`: prompt user for reauthentication
   * - `'consent'`: prompt user for consent before processing request
   * - `'select_account'`: prompt user to select an account
   */
  prompt?: "none" | "login" | "consent" | "select_account";

  /**
   * The default scope to be used on authentication requests
   */
  scope?: string;

  /**
   * Used to store state before doing the redirect
   */
  state?: string;

  /**
   * The space-separated list of language tags, ordered by preference
   * For example: `'fr-CA fr en'`
   */
  ui_locales?: string;

  [key: string]: unknown;
}

export function handleLogin(setting: Setting, provider: ClientFactory) {
  return async ({ res }: ServerOption, options?: LoginOption) => {
    const client = await provider();

    const nonce = generators.nonce();

    const url = client.authorizationUrl({
      redirect_uri: setting.postLoginRedirect,
      scope: setting.scope,
      response_type: "code",
      audience: setting.audience,
      nonce,
      ...options
    });

    setCookie(res, {
      name: "a0:nonce",
      value: nonce,
      maxAge: 60 * 60
    });

    return { url };
  };
}
