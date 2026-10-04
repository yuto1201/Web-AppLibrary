import { html as simplePomoTerms } from "./simple-pomo";
import { html as payCycleTerms } from "./pay-cycle";

/** App-specific terms. Only apps with approved terms are registered here. */
export const termsDocuments: Readonly<Record<string, string>> = {
  "simple-pomo": simplePomoTerms,
  "pay-cycle": payCycleTerms,
};
