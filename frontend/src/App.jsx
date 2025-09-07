import React, { useState } from "react";
import CityForm from "./components/CityForm";
import DaylightChart from "./components/DaylightChart";

export default function App() {
  const [citiesData, setCitiesData] = useState([]); // array of { city, data }
  const [errorMessage, setErrorMessage] = useState(""); // error message state

  const addCity = async (cityName) => {
    if (!cityName) return;

    try {
      const response = await fetch(
        `/api/index.php?city=${encodeURIComponent(cityName)}`
      );

      const data = await response.json();

      // Any failure — invalid city, non-Finnish, or network
      if (!response.ok || data.error) {
        setErrorMessage(
          "City doesn't exist or only Finnish cities are allowed"
        );
        autoClearError();
        return;
      }

      // Success: add city
      setCitiesData((prev) => [...prev, { city: cityName, data }]);
      setErrorMessage(""); // clear previous error if any
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "City doesn't exist or only Finnish cities are allowed"
      );
      autoClearError();
    }
  };

  // Clear error message after 3 seconds
  const autoClearError = () => {
    setTimeout(() => setErrorMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left: City Form */}
        <CityForm onAddCity={addCity} errorMessage={errorMessage} />

        {/* Right: Daylight Chart */}
        <div className="h-[520px]">
          <DaylightChart citiesData={citiesData} />
        </div>
      </div>
    </div>
  );
}
