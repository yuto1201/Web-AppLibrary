import { html as payCycleTerms } from "./pay-cycle";

/** App-specific terms. Only apps with approved terms are registered here. */
export const termsDocuments: Readonly<Record<string, string>> = {
  "pay-cycle": payCycleTerms,
};
