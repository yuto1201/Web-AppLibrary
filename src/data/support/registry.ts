import { html as flowerSupport } from "./flower";

/** App-specific support pages. Apps without one use the AppLibrary contact links. */
export const supportDocuments: Readonly<Record<string, string>> = {
  flower: flowerSupport,
};
