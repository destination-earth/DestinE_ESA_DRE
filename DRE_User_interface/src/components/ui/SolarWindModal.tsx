import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";

const SolarWindModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Opens the modal when the sun icon is clicked
  const handleSunClick = () => {
    setIsModalOpen(true);
  };

  // Closes the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Sun icon button */}
      <button onClick={handleSunClick} className="flex items-center justify-center p-2">
        <FontAwesomeIcon icon={faSun} size="2x" />
      </button>

      {/* Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Solar Packet Activated</h2>
            <p>The Solar Packet is activated.</p>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarWindModal;
