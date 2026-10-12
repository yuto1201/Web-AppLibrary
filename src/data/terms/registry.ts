import { html as flowerTerms } from "./flower";
import { html as simplePomoTerms } from "./simple-pomo";
import { html as payCycleTerms } from "./pay-cycle";

/** App-specific terms. Only apps with approved terms are registered here. */
export const termsDocuments: Readonly<Record<string, string>> = {
  flower: flowerTerms,
  "simple-pomo": simplePomoTerms,
  "pay-cycle": payCycleTerms,
};
