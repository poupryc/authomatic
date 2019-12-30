import Iron from "@hapi/iron";
import { IncomingMessage, ServerResponse } from "http";
import ow from "ow";

import { CookieSetting, parseCookies, setCookie } from "./cookie";

export interface Session {
  /**
   * Any of the claims from the id_token
   */
  readonly user: Record<string, any>;

  /**
   * The id token
   */
  readonly idToken?: string;

  /**
   * The access token
   */
  readonly accessToken?: string;

  /**
   * The refresh token
   */
  readonly refreshToken?: string;

  /**
   * The time on which the session was created
   */
  readonly createdAt: number;
}

/**
 * Shape of the expected configuration object
 */
const sessionPredicate = ow.object.exactShape({
  user: ow.object,
  idToken: ow.optional.string,
  accessToken: ow.optional.string,
  refreshToken: ow.optional.string,
  createdAt: ow.number
});

/**
 * Stores and manages user session data in a cookie
 */
export class SessionStore {
  private setting: Required<CookieSetting>;

  constructor(setting: Required<CookieSetting>) {
    this.setting = setting;
  }

  /**
   * Read data of the current session from the request
   * @param req Incoming HTTP request
   */
  public async read(req: IncomingMessage) {
    const { cookieSecret, cookieName } = this.setting;

    const cookies = parseCookies(req);
    const cookie = cookies[cookieName];
    if (!cookie || cookie.length === 0) return null;

    const unsealed = await SessionStore.unseal(cookie, cookieSecret);
    return unsealed ? (unsealed as Session) : null;
  }

  public async write(res: ServerResponse, session: Session) {
    ow(session, "session object", sessionPredicate);

    const {
      cookieDomain,
      cookieLifetime,
      cookieName,
      cookiePath,
      cookieSameSite,
      cookieSecret
    } = this.setting;

    const encrypted = await SessionStore.seal(session, cookieSecret);

    setCookie(res, {
      name: cookieName,
      value: encrypted,
      path: cookiePath,
      maxAge: cookieLifetime,
      domain: cookieDomain,
      sameSite: cookieSameSite
    });
  }

  /**
   * Decrypt the payload
   * @param payload string generated with seal
   * @param secret secret used to encrypt the payload
   */
  static async unseal(payload: string, secret: string) {
    return await Iron.unseal(payload, secret, Iron.defaults);
  }

  /**
   * Encrypt session object
   * @param session session object to encrypt
   * @param secret secret used to encrypt the session
   */
  static async seal(session: Session, secret: string) {
    return await Iron.seal(session, secret, Iron.defaults);
  }
}
