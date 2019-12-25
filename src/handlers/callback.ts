import { ServerOption } from ".";
import { parseCookies, setCookie } from "../cookie";
import { ClientFactory, Setting } from "../instance";
import { Session, SessionStore } from "../session";
import { assert } from "../utils";

export function handleCallback(
  setting: Setting,
  provider: ClientFactory,
  store: SessionStore
) {
  return async ({ req, res }: ServerOption) => {
    assert(res, "Response is not available");
    assert(req, "Request is not available");

    const cookies = parseCookies(req);
    const nonce = cookies["a0:nonce"];
    if (!nonce) throw new Error("`nonce` could not be found");

    setCookie(res, {
      name: "a0:nonce",
      value: "",
      maxAge: -1
    });

    const client = await provider();
    const params = client.callbackParams(req);
    const token = await client.callback(setting.postLoginRedirect, params, {
      nonce
    });

    const { aud, exp, iat, iss, nonce: _nonce, ...rest } = token.claims();

    const session: Session = {
      user: {
        ...rest
      },
      idToken: token.id_token,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      createdAt: Date.now()
    };

    await store.write(res, session);

    return { redirectTo: setting.postLoginRedirect };
  };
}
