import React from "react";

const Loader = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
      <div className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
