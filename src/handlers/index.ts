import { IncomingMessage, ServerResponse } from "http";

export interface ServerOption {
  /**
   * Incoming HTTP Request
   */
  req: IncomingMessage;

  /**
   * Outgoing HTT Response
   */
  res: ServerResponse;
}

import { handleLogin } from "./login";
import { handleLogout } from "./logout";
import { handleSession } from "./session";
import { handleProfile } from "./profile";
import { handleCallback } from "./callback";

export default {
  handleLogin,
  handleLogout,
  handleCallback,
  handleProfile,
  handleSession
};
