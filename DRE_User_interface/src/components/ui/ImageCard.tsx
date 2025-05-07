import React from 'react';
 

interface ImageCardProps {
  imagePath?: string;
  header: string;
  details: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imagePath, header, details }) => {
  return (
    <div>
      <div className="flex items-center p-4">
        {imagePath && (
          <img
            src={imagePath}
            alt={header}
            className="w-24 h-24 object-cover rounded-md mr-4"
          />
        )}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">{header}</h2>
          <p className="text-gray-600">{details}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
