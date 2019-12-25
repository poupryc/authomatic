import { IncomingMessage, ServerResponse } from "http";
import ow from "ow";
import { NowRequest } from "@now/node";
import { parse, serialize } from "cookie";

interface Cookie {
  /**
   * The name of the cookie
   */
  name: string;

  /**
   * The value of the cookie
   */
  value: string;

  /**
   * The maximum age of the cookie in milliseconds
   */
  maxAge: number;

  /**
   * The domain of the cookie
   */
  domain?: string;

  /**
   * Specifies the boolean or string to be the value
   * for the SameSite Set-Cookie attribute
   */
  sameSite?: boolean | "lax" | "none" | "strict";

  /**
   * The path of the cookie
   */
  path?: string;
}

export interface CookieSetting {
  /**
   * Secret used to encrypt the cookie
   */
  cookieSecret: string;

  /**
   * Name of the cookie in which the session will be stored
   * Defaults to "a0:session"
   */
  cookieName?: string;

  /**
   * Cookie lifetime in seconds
   * After this time has passed, the user will be redirect to Auth0 again
   * Defaults to 8 hours
   */
  cookieLifetime?: number;

  /**
   * Path on which to set the cookie
   * Defaults to "/""
   */
  cookiePath?: string;

  /**
   * The Domain option to set on the cookie
   * Defaults to omitting the option, which restricts the cookie to
   * the host of the current document URL, not including subdomains
   */
  cookieDomain?: string;

  /**
   * SameSite support for the session cookie which helps mitigate CSRF attacks
   * Defaults to "Lax"
   */
  cookieSameSite?: boolean | "lax" | "none" | "strict";

  /**
   * Save the id_token in the cookie
   * Defaults to "false"
   */
  storeIdToken?: boolean;

  /**
   * Save the access_token in the cookie
   * Defaults to "false"
   */
  storeAccessToken?: boolean;

  /**
   * Save the refresh_token in the cookie
   * Defaults to "false"
   */
  storeRefreshToken?: boolean;
}

/**
 * Shape of the expected cookie's configuration object
 */
export const cookiePredicate = ow.object.exactShape({
  cookieSecret: ow.string.minLength(32),
  cookieName: ow.optional.string.nonEmpty,
  cookieLifetime: ow.optional.number.positive,
  cookiePath: ow.optional.string.nonEmpty,
  cookieDomain: ow.optional.string.nonEmpty,
  cookieSameSite: ow.optional.any(
    ow.boolean,
    ow.string.oneOf(["lax", "none", "strict"])
  ),
  storeIdToken: ow.optional.boolean,
  storeAccessToken: ow.optional.boolean,
  storeRefreshToken: ow.optional.boolean
});

/**
 * Default Cookie's setting
 */
export const cookieDefault: Partial<CookieSetting> = {
  cookieName: "a0:session",
  cookieLifetime: 60 * 60 * 8,
  cookiePath: "/",
  storeAccessToken: false,
  storeIdToken: false,
  storeRefreshToken: false
};

/**
 * Parses the cookies from an API Route or from Pages and
 * returns a key/value object containing all the cookies
 * @param req Incoming HTTP request
 */
export function parseCookies(req: IncomingMessage) {
  const { cookies } = req as NowRequest;

  // For API Routes we don't need to parse the cookies
  if (cookies) return cookies;

  // For pages we still need to parse the cookies
  const cookie = req.headers.cookie || "";
  return parse(cookie);
}

/**
 * Serialize a cookie to a string
 * @param cookie The cookie to serialize
 * @param secure Create a secure cookie
 */
export const serializeCookie = (cookie: Cookie, secure: boolean) =>
  serialize(cookie.name, cookie.value, {
    maxAge: cookie.maxAge,
    expires: new Date(Date.now() + cookie.maxAge * 1000),
    httpOnly: true,
    path: cookie.path,
    domain: cookie.domain,
    sameSite: cookie.sameSite,
    secure
  });

/**
 * Set one or more cookies
 * @param res Server HTTP Response
 * @param cookie The cookie or cookies to set
 */
export function setCookie(res: ServerResponse, cookie: Cookie | Cookie[]) {
  const secure = process.env.NODE_ENV === "production";

  const data = Array.isArray(cookie)
    ? cookie.map(c => serializeCookie(c, secure))
    : [serializeCookie(cookie, secure)];

  const jar = res.getHeader("Set-Cookie") as string[];
  res.setHeader("Set-Cookie", jar ? jar.concat(data) : data);
}
