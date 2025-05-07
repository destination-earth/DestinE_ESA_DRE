import classNames from "classnames";
import { PlantTypeEnum } from "../models/enum/PlantType.enum";
import { useTranslation } from "react-i18next";
import { faSun, faWind } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HybridIcon from "./hybrid/HybridIcon";

interface Props {
  type: PlantTypeEnum;
}

const DashboardTypeIndicator = ({ type: selectedType }: Props) => {
  const types = [
    { key: "solar", value: 10, icon: <FontAwesomeIcon icon={faSun} /> },
    { key: "wind", value: 20, icon: <FontAwesomeIcon icon={faWind} /> },
    { key: "hybrid", value: 30, icon: <HybridIcon />, color: "green-400" },
  ];

  const { t } = useTranslation();
  // const types = (Object.keys(PlantTypeEnum) as Array<keyof typeof PlantTypeEnum>);
  return (
    <div className="flex gap-2 rounded border border-theme">
      {types.map((type, index) => (
        <div
          key={index}
          className={classNames(
            "relative w-40 py-2 text-center",
            selectedType === type.value ? "bg-theme text-white" : "text-theme",
          )}
        >
          <div className="relative z-10 flex items-center justify-center gap-2 font-semibold">
            {/* <span>{type.icon}</span> */}
            {t(`enum.plantType.${type.value}`)}
          </div>

          {selectedType === type.value ? (
            <div className="absolute bottom-0 left-1/2 z-0 aspect-square w-5 -translate-x-1/2 translate-y-1/2 rotate-45 bg-theme"></div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default DashboardTypeIndicator;
