import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const Navbar = ({ signout, isSignedIn }) => {
  const navigate = useNavigate();

  const handleSignout = async () => {
    signout();
    try {
      const res = await fetch("http://localhost:5000/logout", {
        method: "GET",
      });
      const data = await res.json();
      if (res.status === 200) {
        localStorage.removeItem("token");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-gray-900 to-black sticky top-0 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white text-2xl font-bold hover:text-gray-300 transition duration-300"
            >
              <Icon icon="mdi:robot" className="text-3xl inline mr-2" />
              PDF-RAG-CHAT-BOT
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition duration-300"
              >
                Home
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    to="/upload"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition duration-300"
                  >
                    Upload
                  </Link>
                  <Link
                    to="/chat"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition duration-300"
                  >
                    Chat
                  </Link>
                </>
              )}
              {!isSignedIn && (
                <Link
                  to="/signin"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition duration-300"
                >
                  Sign In
                </Link>
              )}
              {isSignedIn && (
                <button
                  onClick={handleSignout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition duration-300"
                >
                  <Icon icon="mdi:logout" className="text-xl inline mr-1" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            {/* Add mobile menu icon or toggle button here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
