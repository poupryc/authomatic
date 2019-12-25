import { createInstance, Setting } from "./instance";
import { setCookie } from "./cookie";

export function initAuth0(setting: Setting): ReturnType<typeof createInstance> {
  const isBrowser = typeof window !== "undefined" || (process as any).browser;

  if (isBrowser) return require("./browser").createInstance();

  return require("./instance").createInstance(setting);
}

export { setCookie };
