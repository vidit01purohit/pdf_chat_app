import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";

const SigninForm = ({ signin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignin = () => {
    signin();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token); // Save token to local storage
        handleSignin();
        navigate("/upload");
      } else {
        alert(data.message[0].messages[0].message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Error logging in");
    }
    setEmail("");
    setPassword("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-60 bg-gray-900 rounded-lg">
            <Loader />
          </div>
        )}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Sign In
        </h2>
        {!isLoading && (
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 ${isLoading ? "opacity-50" : ""}`}
          >
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-300 text-purple-800 py-2 rounded-md hover:bg-yellow-400 transition duration-300"
            >
              Sign In
            </button>
          </form>
        )}

        <div className="flex justify-center items-center mt-6">
          <button className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-300">
            Sign in with Google
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-600 transition duration-300"
          >
            Don't have an account? Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
