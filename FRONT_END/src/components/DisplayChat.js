import React, { useEffect, useRef } from "react";

const DisplayChat = ({ chats }) => {
  const scrollableDivRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const div = scrollableDivRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div
      ref={scrollableDivRef}
      className="h-[30rem] overflow-y-auto w-full max-w-2xl mx-auto flex flex-col bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 p-4 rounded-lg shadow-xl"
    >
      <div className="flex-grow overflow-y-auto p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
        {chats.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-xs md:max-w-md p-4 rounded-lg shadow-md ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {message.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default DisplayChat;
