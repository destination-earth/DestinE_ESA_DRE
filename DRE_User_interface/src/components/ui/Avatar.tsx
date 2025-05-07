import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  name?: string;
}

const Avatar = ({ name }: Props) => {
  return (
    <div className="flex aspect-square w-10 items-center justify-center rounded-full bg-gray-200 uppercase text-gray-600">
      {name && name?.length >= 2 ? (
        name?.slice(0, 2)
      ) : (
        <FontAwesomeIcon icon={faUser} />
      )}
    </div>
  );
};

export default Avatar;
