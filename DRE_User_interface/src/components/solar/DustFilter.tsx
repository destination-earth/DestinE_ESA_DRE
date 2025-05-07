import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { InputRange } from "../ui/InputRange";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import dustImage from "../../assets/dust_small.png";


interface Props {
  onChange: (v: number) => void;
}

const DustFilter = ({ onChange }: Props) => {
  const [dust, setDust] = useState<number>(0);
  const handleFilterChange = (v: number) => {
    console.log("ti dust exo re si?")
    console.log(v);
    
    setDust(v);
    onChange(v);
  };

  return (
    <div className="">
      <div className="mb-2 text-sm font-medium leading-6 text-gray-900">
      Dust event: {dust === 0
          ? "No dust"
          : dust === 1
          ? "Low dust"
          : dust === 2
          ? "Moderate dust"
          : "High dust"}
      </div>
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faSun} size="2x" className="text-yellow-400" />
        <InputRange
          step={1}
          value={dust}
          min={0}
          max={3}
          onChange={handleFilterChange}
        />
        {/* <FontAwesomeIcon icon={faCloud} size="2x" className="text-gray-300" />
        <FontAwesomeIcon icon={faGrip} size="2x" className="text-gray-400" /> */}
        <img src={dustImage} alt="Dust Icon" className="dust-icon"  style={{ width: "40px", height: "40px" }} />

        
      </div>
    </div>
  );
};

export default DustFilter;
