import { ReactNode } from "react";

interface Props {
  title?: string;
  children?: ReactNode;
  className?: string;
}

const Card = ({ title, children, className = "" }: Props) => {
  return (
    <div className={`flex flex-col gap-3 rounded border p-5 ${className}`}>
      {title ? <h5 className="text-xl">{title}</h5> : null}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Card;
