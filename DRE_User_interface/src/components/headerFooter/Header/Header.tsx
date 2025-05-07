import React from "react";
import HeaderLeft from "./HeaderLeft";
import HeaderCenter from "./HeaderCenter";
import HeaderRight from "./HeaderRight";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="flex h-16 w-full items-center justify-center bg-[#0D1527] text-white z-50">
      <div className="flex h-full w-full items-center px-20">
        <HeaderLeft />
        <HeaderCenter />
        <HeaderRight />
      </div>
    </header>
  );
};

export default Header;
