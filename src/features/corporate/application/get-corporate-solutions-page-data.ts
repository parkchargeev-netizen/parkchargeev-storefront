import {
  corporateBenefits,
  corporateMetrics,
  corporateProjectSteps,
  corporateStandards
} from "@/features/corporate/domain/corporate-content";
import { solutionPages } from "@/lib/mock-data";

export function getCorporateSolutionsPageData() {
  return {
    benefits: corporateBenefits,
    metrics: corporateMetrics,
    projectSteps: corporateProjectSteps,
    standards: corporateStandards,
    solutions: solutionPages
  };
}

export type CorporateSolutionsPageData = ReturnType<
  typeof getCorporateSolutionsPageData
>;
