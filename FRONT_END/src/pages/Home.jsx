import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-600 to-red-600 min-h-screen flex items-center justify-center">
      <div className="text-center text-white p-8 rounded-lg shadow-2xl bg-opacity-80 backdrop-blur-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wider">
          Welcome to <span className="text-yellow-300">PDF-RAG-CHAT-BOT</span>
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Your intelligent chatbot for all things PDF. Upload, query, and
          interact with your documents seamlessly.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="bg-yellow-400 text-purple-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-yellow-500 transition-transform transform hover:-translate-y-1 duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
