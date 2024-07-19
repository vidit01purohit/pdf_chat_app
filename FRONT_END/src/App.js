import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [embedMessage, setEmbedMessage] = useState("");
  const [chat, setChat] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append("files", file);
    }
    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setUploadMessage(res.data.message);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "system", message: res.data.message },
      ]);
      console.log(res.data.message); // Debugging
    } catch (error) {
      console.error(error);
      setUploadMessage("Failed to upload files");
      setChat((prevChat) => [
        ...prevChat,
        { sender: "system", message: "Failed to upload files" },
      ]);
    }
  };

  const handleEmbedding = async () => {
    try {
      const res = await axios.post("http://localhost:5000/embed");
      setEmbedMessage(res.data.message);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "system", message: res.data.message },
      ]);
      console.log(res.data.message); // Debugging
    } catch (error) {
      console.error(error);
      setEmbedMessage("Failed to create embeddings");
      setChat((prevChat) => [
        ...prevChat,
        { sender: "system", message: "Failed to create embeddings" },
      ]);
    }
  };

  const handleQuery = async () => {
    setChat((prevChat) => [...prevChat, { sender: "user", message: query }]);
    setQuery("");
    try {
      const res = await axios.post("http://localhost:5000/query", { query });
      setResponse(res.data);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "bot", message: res.data.answer },
      ]);
      console.log(res.data); // Debugging
    } catch (error) {
      console.error(error);
      alert("Failed to query documents");
    }
  };

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:5000/reset");
      setSelectedFiles([]);
      setQuery("");
      setResponse(null);
      setUploadMessage("");
      setEmbedMessage("");
      setChat([]);
      console.log("Chat reset and PDFs deleted");
    } catch (error) {
      console.error("Failed to reset chat and delete PDFs", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        PDF Chatbot With Hugging Face Embeddings
      </h1>
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
        <div className="flex flex-col mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mb-2 border border-gray-300 rounded-lg p-2"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-2"
          >
            Upload PDFs
          </button>
          {uploadMessage && (
            <p className="mt-2 text-sm text-gray-600">{uploadMessage}</p>
          )}
        </div>
        <div className="flex flex-col mb-4">
          <button
            onClick={handleEmbedding}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-2"
          >
            Create Document Embeddings
          </button>
          {embedMessage && (
            <p className="mt-2 text-sm text-gray-600">{embedMessage}</p>
          )}
        </div>
        <div className="flex flex-col mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your question"
            className="mb-2 border border-gray-300 rounded-lg p-2"
          />
          <button
            onClick={handleQuery}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 mb-2"
          >
            Submit Query
          </button>
        </div>
        <div className="chat-container overflow-y-auto max-h-96 mb-4">
          {chat.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`p-4 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {message.message}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Reset Chat and Delete PDFs
        </button>
      </div>
    </div>
  );
}

export default App;
