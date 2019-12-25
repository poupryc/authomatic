/**
 * Simulates the creation of an instance if the module is used client-side
 */
export function createInstance() {
  const handler: ProxyHandler<object> = {
    get: () => {
      throw new Error("This function can only be used from the server side");
    }
  };

  return new Proxy({}, handler);
}
