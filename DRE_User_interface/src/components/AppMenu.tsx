import AppMenuItem from "./AppMenuItem";
import { MenuItem } from "../models/InitialSettings";

interface Props {
  open: boolean;
  menu: MenuItem[];
}

const AppMenu = ({ open, menu }: Props) => {
  return (
    <nav className="flex h-full flex-col bg-gray-800 text-white">
      {menu.map((navItem) => (
        <AppMenuItem key={navItem.id} menuItem={navItem} open={open} />
      ))}
    </nav>
  );
};

export default AppMenu;
