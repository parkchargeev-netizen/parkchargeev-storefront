import {
  corporateBenefits,
  corporateMetrics,
  corporateProjectSteps,
  corporateStandards
} from "@/features/corporate/domain/corporate-content";
import { withCleanCorporateSolutionCopy } from "@/features/corporate/domain/corporate-solution-copy";
import { solutionPages } from "@/lib/mock-data";

export function getCorporateSolutionsPageData() {
  return {
    benefits: corporateBenefits,
    metrics: corporateMetrics,
    projectSteps: corporateProjectSteps,
    standards: corporateStandards,
    solutions: solutionPages.map(withCleanCorporateSolutionCopy)
  };
}

export type CorporateSolutionsPageData = ReturnType<
  typeof getCorporateSolutionsPageData
>;
