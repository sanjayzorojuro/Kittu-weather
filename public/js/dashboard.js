 const API_KEY = "6dd144367162ab13fb56cac4972ea682";

      const weatherIcons = {
        "01d": "☀️",
        "01n": "🌙",
        "02d": "⛅",
        "02n": "☁️",
        "03d": "☁️",
        "03n": "☁️",
        "04d": "☁️",
        "04n": "☁️",
        "09d": "🌧️",
        "09n": "🌧️",
        "10d": "🌦️",
        "10n": "🌧️",
        "11d": "⛈️",
        "11n": "⛈️",
        "13d": "❄️",
        "13n": "❄️",
        "50d": "🌫️",
        "50n": "🌫️",
      };

      // window.addEventListener('load', () => {
      //     if (navigator.geolocation) {
      //         navigator.geolocation.getCurrentPosition(
      //             position => {
      //                 fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      //             },
      //             error => {
      //                 fetchWeatherByCity('udupi');
      //             }
      //         );
      //     } else {
      //         fetchWeatherByCity('udupi');
      //     }
      // });

      (function () {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
          document.documentElement.classList.add("dark-mode");
        }
      })();

      window.addEventListener("load", () => {
        const savedCity = localStorage.getItem("selectedCity");

        if (savedCity) {
          // Load the last selected city
          fetchWeatherByCity(savedCity);
        } else if (navigator.geolocation) {
          // Try getting the current location if no city saved
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetchWeatherByCoords(
                position.coords.latitude,
                position.coords.longitude
              );
            },
            (error) => {
              // Default city if everything fails
              fetchWeatherByCity("udupi");
            }
          );
        } else {
          fetchWeatherByCity("udupi");
        }
      });

      document.getElementById("cityInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          searchWeather();
        }
      });

      function searchWeather() {
        const city = document.getElementById("cityInput").value.trim();
        if (city) {
          fetchWeatherByCity(city);
        }
      }

      async function fetchWeatherByCity(city) {
        showLoading();
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "City not found");
          }
          const data = await response.json();
          updateWeatherDisplay(data);
          fetchHourlyForecast(data.coord.lat, data.coord.lon);
        } catch (error) {
          console.error("Weather fetch error:", error);
          showError(
            error.message || "City not found. Please try another city."
          );
          document.getElementById("temperature").textContent = "--°C";
        }
      }

      async function fetchWeatherByCoords(lat, lon) {
        showLoading();
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Unable to fetch weather");
          }
          const data = await response.json();
          updateWeatherDisplay(data);
          fetchHourlyForecast(lat, lon);
        } catch (error) {
          console.error("Weather fetch error:", error);
          showError(error.message || "Unable to fetch weather data.");
          document.getElementById("temperature").textContent = "--°C";
        }
      }

      async function fetchHourlyForecast(lat, lon) {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          updateHourlyForecast(data.list.slice(0, 8));
          updateTempChart(data.list.slice(0, 7));
        } catch (error) {
          console.error("Error fetching hourly forecast:", error);
        }
      }

      function updateWeatherDisplay(data) {
        clearError();

        document.getElementById(
          "location"
        ).textContent = `📍 ${data.name}, ${data.sys.country}`;
        document.getElementById("temperature").textContent = `${Math.round(
          data.main.temp
        )}°C`;
        document.getElementById("description").textContent =
          data.weather[0].description;
        document.getElementById("weatherIcon").textContent =
          weatherIcons[data.weather[0].icon] || "🌡️";

        document.getElementById("feelsLike").textContent = `${Math.round(
          data.main.feels_like
        )}°C`;
        document.getElementById(
          "humidity"
        ).textContent = `${data.main.humidity}%`;
        document.getElementById("visibility").textContent = `${(
          data.visibility / 1000
        ).toFixed(1)} km`;
        document.getElementById(
          "pressure"
        ).textContent = `${data.main.pressure} mb`;

        document.getElementById(
          "windSpeed"
        ).textContent = `${data.wind.speed} m/s`;
        document.getElementById(
          "windDirection"
        ).textContent = `${getWindDirection(data.wind.deg)} Direction`;

        document.getElementById("cityInput").value = "";

        localStorage.setItem("selectedCity", data.name);
      }

      function updateHourlyForecast(hourlyData) {
        const container = document.getElementById("hourlyForecast");
        container.innerHTML = "";

        for (let i = 0; i < hourlyData.length; i += 2) {
          const rowDiv = document.createElement("div");
          rowDiv.className = "boxxex";

          for (let j = i; j < Math.min(i + 2, hourlyData.length); j++) {
            const hour = hourlyData[j];
            const date = new Date(hour.dt * 1000);
            const hourDiv = document.createElement("div");
            hourDiv.className = "boxx";
            hourDiv.style.animationDelay = `${j * 0.1}s`;
            hourDiv.innerHTML = `
                        <div class="time-label">${date.getHours()}:00</div>
                        <div class="forecast-icon">${
                          weatherIcons[hour.weather[0].icon] || "🌡️"
                        }</div>
                        <div class="forecast-temp">${Math.round(
                          hour.main.temp
                        )}°C</div>
                    `;
            rowDiv.appendChild(hourDiv);
          }

          container.appendChild(rowDiv);
        }
      }

      function updateTempChart(data) {
        const container = document.getElementById("tempChart");
        const temps = data.map((d) => d.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const range = maxTemp - minTemp || 1;

        container.innerHTML = "";
        data.forEach((hour, i) => {
          const height = ((hour.main.temp - minTemp) / range) * 70 + 20;
          const bar = document.createElement("div");
          bar.className = "chart-bar";
          bar.style.height = `${height}%`;
          bar.style.animationDelay = `${i * 0.1}s`;
          container.appendChild(bar);
        });
      }

      function getWindDirection(degree) {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(degree / 45) % 8;
        return directions[index];
      }

      function showLoading() {
        document.getElementById("temperature").innerHTML =
          '<div class="loading"></div>';
        document.getElementById("description").textContent = "Loading...";
      }

      function showError(message) {
        document.getElementById(
          "errorMessage"
        ).innerHTML = `<div class="error-message">${message}</div>`;
      }

      function clearError() {
        document.getElementById("errorMessage").innerHTML = "";
      }