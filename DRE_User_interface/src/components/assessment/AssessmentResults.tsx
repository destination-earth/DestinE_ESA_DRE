import React from "react";
import SolarAssessmentResults, {
  SolarAssessmentApiResponse,
} from "./assessmentResults/SolarAssessmentResults";
import WindAssessmentResults, {
  WindAssessmentApiResponse,
} from "./assessmentResults/WindAssessmentResults";

// Generic assessment response type that could be either solar or wind
export type AssessmentResponse =
  | SolarAssessmentApiResponse
  | WindAssessmentApiResponse;

interface AssessmentResultsProps {
  data: AssessmentResponse;
  energyType: "solar" | "wind";
  startDate?: string;
  endDate?: string;
  onDownload?: () => void;
  isPremium?: boolean;
  isOnlyGroup1Filled?: boolean;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  data,
  energyType,
  startDate,
  endDate,
  onDownload,
  isPremium = false,
  isOnlyGroup1Filled = false,
}) => {
  // Remove unused translation variable since it's not being used in this component
  // The child components (SolarAssessmentResults and WindAssessmentResults) have their own translation hooks

  // Render the appropriate component based on energy type
  if (energyType === "solar") {
    return (
      <SolarAssessmentResults
        data={data as SolarAssessmentApiResponse}
        onDownload={onDownload}
        isPremium={isPremium}
        isOnlyGroup1Filled={isOnlyGroup1Filled}
      />
    );
  } else {
    return (
      <WindAssessmentResults
        data={data as WindAssessmentApiResponse}
        startDate={startDate}
        endDate={endDate}
        onDownload={onDownload}
        isPremium={isPremium}
      />
    );
  }
};

export default AssessmentResults;
