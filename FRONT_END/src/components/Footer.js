import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center text-white">
        <p className="text-sm mb-2">© 2024 DocQueryAI. All rights reserved.</p>
        <div className="flex space-x-6 mb-4">
          <Link to="/privacy" className="hover:underline hover:text-yellow-300">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:underline hover:text-yellow-300">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:underline hover:text-yellow-300">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
