import { Fragment } from "react";
import { Menu as HeadlessuiMenu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { ReactNode } from "@tanstack/react-router";

interface Option {
  name: string;
  handler: () => void;
}

interface Props {
  trigger: ReactNode;
  options: Option[];
}

const Menu = ({ trigger, options }: Props) => {
  return (
    <HeadlessuiMenu as="div" className="relative inline-block text-left">
      <div>
        <HeadlessuiMenu.Button className="">{trigger}</HeadlessuiMenu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        
        <HeadlessuiMenu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((o, i) => (
              <HeadlessuiMenu.Item key={i}>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm",
                    )}
                    onClick={() => o?.handler()}
                  >
                    {o.name}
                  </a>
                )}
              </HeadlessuiMenu.Item>
            ))}
          </div>
        </HeadlessuiMenu.Items>
      </Transition>
    </HeadlessuiMenu>
  );
};

export default Menu;