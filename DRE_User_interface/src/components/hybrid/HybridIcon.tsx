import { faSun, faWind } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HybridIcon = () => {
  return (
    <div className="flex">
      <div className="text-yellow-400- w-1/2 overflow-hidden">
        <FontAwesomeIcon icon={faSun} size="sm" />
      </div>
      <div className="flex- w-1/2- text-blue-400- justify-end overflow-hidden">
        <FontAwesomeIcon icon={faWind} size="sm" />
      </div>
    </div>
  );
};

export default HybridIcon;
