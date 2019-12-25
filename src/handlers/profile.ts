import { SessionStore } from "../session";
import { ServerOption } from ".";
import { assert } from "../utils";

export function handleProfile(session: SessionStore) {
  return async ({ res, req }: ServerOption) => {
    assert(res, "Response is not available");
    assert(req, "Request is not available");

    const data = await session.read(req);
    if (!data || !data.user) {
      throw new Error("User doesn't have an session or isn't authenticated");
    }

    return data.user;
  };
}
