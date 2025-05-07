import { ReactNode } from "@tanstack/react-router";

interface Props {
  firstRow: ReactNode;
  secondRowLeft: ReactNode;
  secondRowRight: ReactNode;
  thirdRow: ReactNode;
}

const WhatIfDashboardLayout = ({
  firstRow,
  secondRowLeft,
  secondRowRight,
  thirdRow,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div>{firstRow}</div>
      <div>{secondRowLeft}</div>
      <div>{secondRowRight}</div>
      <div>{thirdRow}</div>
    </div>
  );
};

export default WhatIfDashboardLayout;
