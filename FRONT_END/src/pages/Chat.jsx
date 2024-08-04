import axios from "axios";
import React, { useState } from "react";
import DisplayChat from "../components/DisplayChat";
import { Icon } from "@iconify/react/dist/iconify.js";

const Chat = () => {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const handleQuery = async (event) => {
    event.preventDefault();
    setChat((prevChat) => [...prevChat, { sender: "user", message: query }]);
    setQuery("");
    try {
      const res = await axios.post(
        "http://localhost:5000/query",
        { query },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center py-12 px-6">
      {/* Chat Display */}
      <div className="w-full max-w-3xl bg-white bg-opacity-90 p-6 rounded-lg shadow-2xl mb-8">
        <DisplayChat chats={chat} />
      </div>

      {/* Query Input and Submit */}
      <form
        onSubmit={handleQuery}
        className="flex w-full max-w-3xl bg-white bg-opacity-90 p-4 rounded-lg shadow-2xl"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your question"
          className="flex-grow border-2 border-gray-300 rounded-l-lg p-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-4 rounded-r-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        >
          <Icon icon="formkit:submit" className="text-2xl mr-2" />
          <span className="hidden md:inline">Submit</span>
        </button>
      </form>
    </div>
  );
};

export default Chat;
