import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append("files", file);
    }
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/chat");
      } else {
        alert(data.message[0].messages[0].message);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadMessage("Failed to upload files");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center py-12 px-6">
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
        {isLoading && <Loader />}
      </div>
      <div className="relative w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 border border-gray-200 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
          Upload Your PDFs
        </h1>
        {!isLoading && (
          <div className="flex flex-col items-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mb-6 w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:-translate-y-1 duration-300"
            >
              Upload PDFs
            </button>
            {uploadMessage && (
              <p className="mt-4 text-sm text-gray-700 text-center">
                {uploadMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
