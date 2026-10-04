import { html as payCycleTerms } from "./pay-cycle";
import { html as simplePomoTerms } from "./simple-pomo";

/** App-specific terms. Only apps with approved terms are registered here. */
export const termsDocuments: Readonly<Record<string, string>> = {
  "pay-cycle": payCycleTerms,
  "simple-pomo": simplePomoTerms,
};
