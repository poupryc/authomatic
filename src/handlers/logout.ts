import { Setting } from "../instance";
import { ServerOption } from ".";
import { setCookie } from "../cookie";
import { assert } from "../utils";

export interface LogoutOption {
  /**
   * Default url to redirect to after the user has signed out
   */
  redirectTo?: string;
}

export function handleLogout(setting: Setting) {
  return async ({ res }: ServerOption, options?: LogoutOption) => {
    assert(res, "Response is not available");

    // Delete session's cookies
    setCookie(res, [
      {
        name: "a0:state",
        value: "",
        maxAge: -1
      },
      {
        name: setting.cookie.cookieName as string,
        value: "",
        maxAge: -1
      }
    ]);

    return createLogoutUrl({ ...setting, ...options });
  };
}

/**
 * Create the logout redirect
 * @param setting module setting
 */
const createLogoutUrl = ({ domain, clientId, postLogoutRedirect }: Setting) => {
  const redirect = encodeURIComponent(postLogoutRedirect);

  return `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${redirect}`;
};
