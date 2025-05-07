import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";
import { MenuIconMap } from "../models/maps/MenuIconMap";
import classNames from "classnames";

interface MenuItem {
  id: number;
  type: string;
  icon: string;
  name: string;
  children?: MenuItem[];
}

interface Props {
  menuItem: MenuItem;
  open: boolean;
  level?: number;
}

const AppMenuItem = ({ menuItem, open, level = 0 }: Props) => {
  const { id, type, icon, name, children } = menuItem;
  const [expanded, setExpanded] = useState(false);
  const hasChildren = children && children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded((prev) => !prev);
  };

  // The content to be rendered inside the clickable area
  const content = (
    <div className="flex items-center">
      <div className={`w-8 ${level > 0 ? `ml-${level * 4}` : ""}`}>
        {hasChildren ? (expanded ? "▼" : "►") : (
          MenuIconMap[icon] ? 
            <FontAwesomeIcon icon={MenuIconMap[icon]} /> : 
            <span title={`Icon '${icon}' not found`}>●</span>
        )}
      </div>
      {open && <span className="pl-2">{name}</span>}
    </div>
  );

  return (
    <div>
      {hasChildren ? (
        // For items with children, use a div with onClick to toggle expansion.
        <div onClick={handleToggle} className={classNames("flex hover:bg-gray-500 p-2 cursor-pointer", { "font-bold": expanded })}>
          {content}
        </div>
      ) : (
        // For leaf items, use the Link component for navigation.
        <Link
          to={`/${type}`}
          params={{ assetId: id }}
          className={classNames("flex hover:bg-gray-500 p-2", { "font-bold": expanded })}>
          {content}
        </Link>
      )}
      {/* Render nested children if expanded */}
      {expanded && hasChildren && (
        <div className="ml-4">
          {children!.map((child) => (
            <AppMenuItem key={child.id} menuItem={child} open={open} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppMenuItem;
