import React, { useState } from "react";
import MyImage from "../images/Sun.svg";

export default function CityForm({ onAddCity, errorMessage }) {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed === "") return;
    onAddCity(trimmed);
    setCity("");
  };

  return (
    <div className="w-full flex flex-col items-start space-y-6">
      {/* Title */}
      <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
        Daylight Tracker
      </h1>

      {/* Subtitle */}
      <h2 className="text-xl text-gray-600">
        Track daylight hours in Finnish cities
      </h2>

      {/* SVG Image */}
      <img src={MyImage} alt="Illustration" className="w-full max-w-xs" />

      {/* Input + Button */}
      <form onSubmit={handleSubmit} className="w-full flex gap-3 mt-4">
        <input
          id="city-input"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a Finnish city (e.g. Helsinki)"
          className={`flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 shadow-sm
            ${errorMessage ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-yellow-400"}`}
        />
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-3 rounded-lg text-sm font-semibold shadow-md transition"
        >
          Add
        </button>
      </form>

      {/* Instruction Text */}
      <p className="text-sm text-gray-500">
        Allowed: Finnish cities only. Max <strong>10</strong> cities.
      </p>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
