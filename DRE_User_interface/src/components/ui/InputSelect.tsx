import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useState } from "react";

interface Props {
  label: string;
  defaultValue?: { value: string; name: string; icon?: IconProp };
  options?: {
    value: string;
    name: string;
    icon?: IconProp;
    iconColor?: string;
  }[];
  onChange: (v: string) => void;
}

const InputSelect = ({ label, defaultValue, options, onChange }: Props) => {
  const [selected, setSelected] = useState<
    | {
        value: string;
        name: string;
        icon?: IconProp;
        iconColor?: string;
      }
    | null
    | undefined
  >(defaultValue);

  const handleChange = (item: {
    value: string;
    name: string;
    icon?: IconProp;
    iconColor?: string;
  }) => {
    setSelected(item);
    onChange(item.value);
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
            {label}
          </Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                {selected?.icon ? (
                  <span className={classNames(selected.iconColor)}>
                    <FontAwesomeIcon icon={selected?.icon} />
                  </span>
                ) : null}
                <span className="ml-3 block truncate">
                  {selected?.name ?? defaultValue?.name}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <FontAwesomeIcon icon={faChevronDown} />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options?.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-gray-100" : "text-gray-900",
                        "relative cursor-pointer select-none py-2 pl-3 pr-9",
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          {option?.icon ? (
                            <span className={option.iconColor}>
                              <FontAwesomeIcon icon={option?.icon} />
                            </span>
                          ) : null}
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate",
                            )}
                          >
                            {option.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                            )}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default InputSelect;
