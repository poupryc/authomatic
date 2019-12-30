import { NowRequest } from "@now/node";

import { ServerOption } from ".";
import { SessionStore, Session } from "../session";
import { parseCookies } from "../cookie";

export function handleSession(store: SessionStore) {
  return async ({ req }: ServerOption) => store.read(req);
}

interface SessionHookOption {
  secret: string;
  cookieName: string;
}

interface SessionHookReturn {
  authenticated: boolean;
  session: Session | null;
}

/**
 * Use auth session
 * @param req request
 * @param option hook option
 */
export async function useSession(req: NowRequest, option: SessionHookOption) {
  const result: SessionHookReturn = { authenticated: false, session: null };

  const cookies = parseCookies(req);
  const cookie = cookies[option.cookieName];
  if (!cookie || cookie.length === 0) return result;

  const unsealed = await SessionStore.unseal(cookie, option.secret);
  if (!unsealed) return result;

  result.authenticated = true;
  result.session = unsealed;

  return result;
}
