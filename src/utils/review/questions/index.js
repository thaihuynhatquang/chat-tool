import sale from "./sale";
import customerCare from "./customerCare";

export const SALE_REVIEW_QUESTIONS = "review-sale";
export const CS_REVIEW_QUESTIONS = "review-cs";

export default {
  [SALE_REVIEW_QUESTIONS]: sale,
  [CS_REVIEW_QUESTIONS]: customerCare,
};
