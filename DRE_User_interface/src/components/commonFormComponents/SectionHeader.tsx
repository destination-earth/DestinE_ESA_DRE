import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string | React.ReactNode;
}

const SectionHeader = ({
  title,
  description,
}: SectionHeaderProps): React.ReactNode => {
  return (
    <>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {description && <p className="mb-6 text-gray-600">{description}</p>}
    </>
  );
};

export default SectionHeader;
