import { ReactNode } from "@tanstack/react-router";

interface Props {
  firstRow: ReactNode;
  secondRowLeft: ReactNode;
  secondRowRight: ReactNode;
  thirdRow: ReactNode;
}

const DashboardLayout = ({
  firstRow,
  secondRowLeft,
  secondRowRight,
  thirdRow,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div>{firstRow}</div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div>{secondRowLeft}</div>
        <div>{secondRowRight}</div>
      </div>
      <div>{thirdRow}</div>
    </div>
  );
};

 
export default DashboardLayout;
