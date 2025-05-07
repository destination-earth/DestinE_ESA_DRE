 import { ReactNode } from "@tanstack/react-router";

interface Props {
  navigationRow: ReactNode;
  firstRow: ReactNode;
  secondRow: ReactNode;
  thirdRow: ReactNode;
}

const AssessmentLayout = ({
  navigationRow,
  firstRow,
  secondRow,
  thirdRow,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div>{navigationRow}</div> 
      <div>{firstRow}</div> 
      <div>{secondRow}</div>
      <div>{thirdRow}</div>
      
    </div>
  );
};

export default AssessmentLayout;
