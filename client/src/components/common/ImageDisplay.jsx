import React from "react";

const ImageDisplay = ({ pictures = [] }) => {
  const [selectedImage, setSelectedImage] = React.useState(null);

  if (!pictures || pictures.length === 0) {
    return (
      <div className="flex items-center justify-center h-16">
        <span className="text-sm text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex -space-x-2">
        {pictures.slice(0, 3).map((image, index) => (
          <div 
            key={index}
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden cursor-pointer hover:z-10 shadow-sm"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {pictures.length > 3 && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-900 shadow-sm">
            +{pictures.length - 3}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full mx-4">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;
