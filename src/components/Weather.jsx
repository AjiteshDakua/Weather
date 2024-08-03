import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";
import smog_icon from "../assets/smog.png";
import location_icon from "../assets/location.png";

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [isCurrentLocation, setIsCurrentLocation] = useState(true);

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13a": snow_icon,
    "50d": smog_icon,
    "50n": smog_icon,
  };

  const fetchWeatherData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      console.log(data);
      const icon = allIcons[data.weather[0]?.icon] || clear_icon;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        rain: data.rain ? data.rain["1h"] : 0, // 1-hour rain volume
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        location: data.name,
        icon: icon,
      });
      setIsCurrentLocation(url.includes("lat=")); // Set based on URL
    } catch (error) {
      setWeatherData(null);
      setError("Error fetching weather data");
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchWeatherByCoords = (latitude, longitude) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${
      import.meta.env.VITE_APP_ID
    }`;
    fetchWeatherData(url);
  };

  const search = (city) => {
    if (city === "") {
      alert("Please enter a city name");
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
      import.meta.env.VITE_APP_ID
    }`;
    fetchWeatherData(url);
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getCurrentLocationWeather(); // Fetch weather for the current location on initial render
  }, []);

  return (
    <div className="weather">
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search(inputRef.current.value);
            }
          }}
        />
        <img
          src={search_icon}
          alt="Search"
          onClick={() => search(inputRef.current.value)}
        />
        {!isCurrentLocation && (
          <img
            src={location_icon}
            className="location-icon"
            alt="Current Location"
            onClick={getCurrentLocationWeather}
            style={{ cursor: "pointer", marginLeft: "10px" }}
          />
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      {weatherData ? (
        <>
          <img
            src={weatherData.icon}
            alt="Weather Icon"
            className="weather-icon"
          />
          <p className="temp">{weatherData.temperature}°C</p>
          <p className="feels-like">Feels Like: {weatherData.feelsLike}°C</p>
          <p className="location">{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="Humidity Icon" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="Wind Speed Icon" />
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
            <div className="col">
              <img src={rain_icon} alt="Rain Icon" />
              <div>
                <p>{weatherData.rain} mm</p>
                <span>Rain (last hour)</span>
              </div>
            </div>
            <div className="col">
              <p>Sunrise: {weatherData.sunrise}</p>
              <p>Sunset: {weatherData.sunset}</p>
            </div>
          </div>
        </>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
};

export default Weather;
