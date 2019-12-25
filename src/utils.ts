/**
 * Throw error if the value is falsy
 * @param value value
 * @param message message
 */
export const assert = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};
