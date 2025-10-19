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

      const weatherConditions = {
        Clear: "sunny",
        Clouds: "cloudy",
        Rain: "rainy",
        Drizzle: "rainy",
        Thunderstorm: "thunderstorm",
        Snow: "snowy",
        Mist: "cloudy",
        Fog: "cloudy",
      };

      // Get URL parameters
      function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
          city: params.get("city"),
          lat: params.get("lat"),
          lon: params.get("lon"),
        };
      }

      // Load forecast on page load
      window.addEventListener("load", () => {
        const params = getUrlParams();

        if (params.city && params.lat && params.lon) {
          document.getElementById(
            "cityName"
          ).textContent = `📍 ${params.city} - Detailed daily predictions`;
          fetchForecast(params.lat, params.lon, params.city);
        } else {
          // Default to Udupi
          fetchWeatherByCity("Udupi");
        }
      });

      // Search functionality
      document.getElementById("cityInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const city = document.getElementById("cityInput").value.trim();
          if (city) {
            fetchWeatherByCity(city);
          }
        }
      });

      async function fetchWeatherByCity(city) {
        showLoading();
        hideError();
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "City not found");
          }

          const data = await response.json();
          document.getElementById(
            "cityName"
          ).textContent = `📍 ${data.name} - Detailed daily predictions`;
          document.getElementById("cityInput").value = "";

          // Update URL without reloading
          const newUrl = `${window.location.pathname}?city=${encodeURIComponent(
            data.name
          )}&lat=${data.coord.lat}&lon=${data.coord.lon}`;
          window.history.pushState({}, "", newUrl);

          fetchForecast(data.coord.lat, data.coord.lon, data.name);
        } catch (error) {
          console.error("Weather fetch error:", error);
          showError(
            error.message || "City not found. Please try another city."
          );
          hideLoading();
        }
      }

      async function fetchForecast(lat, lon, cityName) {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );

          if (!response.ok) {
            throw new Error("Unable to fetch forecast data");
          }

          const data = await response.json();
          processForecastData(data, cityName);
        } catch (error) {
          console.error("Forecast fetch error:", error);
          showError("Unable to load forecast data. Please try again later.");
          hideLoading();
        }
      }

      function processForecastData(data, cityName) {
        // Group forecast by day (API provides 3-hour intervals)
        const dailyForecasts = {};

        data.list.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const dateKey = date.toDateString();

          if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
              date: date,
              temps: [],
              weather: item.weather[0],
              humidity: [],
              wind: [],
              rain: [],
              visibility: [],
            };
          }

          dailyForecasts[dateKey].temps.push(item.main.temp);
          dailyForecasts[dateKey].humidity.push(item.main.humidity);
          dailyForecasts[dateKey].wind.push(item.wind.speed);
          dailyForecasts[dateKey].rain.push(item.pop * 100);
          dailyForecasts[dateKey].visibility.push(item.visibility / 1000);
        });

        // Convert to array and take first 5 days
        const forecastArray = Object.values(dailyForecasts).slice(0, 5);
        displayForecast(forecastArray, cityName);
      }

      function displayForecast(forecasts, cityName) {
        const grid = document.getElementById("forecastGrid");
        const loading = document.getElementById("loadingMessage");

        loading.style.display = "none";
        grid.style.display = "grid";
        grid.innerHTML = "";

        forecasts.forEach((forecast, index) => {
          const maxTemp = Math.max(...forecast.temps);
          const minTemp = Math.min(...forecast.temps);
          const avgHumidity = Math.round(
            forecast.humidity.reduce((a, b) => a + b) / forecast.humidity.length
          );
          const avgWind = (
            forecast.wind.reduce((a, b) => a + b) / forecast.wind.length
          ).toFixed(1);
          const maxRain = Math.round(Math.max(...forecast.rain));
          const avgVisibility = (
            forecast.visibility.reduce((a, b) => a + b) /
            forecast.visibility.length
          ).toFixed(1);

          const dayName = forecast.date.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const dateStr = forecast.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const weatherType =
            weatherConditions[forecast.weather.main] || "cloudy";

          const card = document.createElement("div");
          card.className = "forecast-card";
          card.style.animationDelay = `${index * 0.1}s`;

          card.innerHTML = `
            <div class="card-header">
              <div class="day-info">
                <h3>${dayName}</h3>
                <div class="date-info">${dateStr}</div>
              </div>
              <div class="temp-range">
                <div class="high-temp">${Math.round(maxTemp)}°C</div>
                <div class="low-temp">${Math.round(minTemp)}°C</div>
              </div>
            </div>

            <div class="weather-scene">
              ${generateWeatherSVG(weatherType, forecast.weather.icon)}
            </div>

            <div class="weather-details">
              <div class="detail-item">
                <div class="detail-icon">💧</div>
                <div class="detail-content">
                  <div class="detail-label">Humidity</div>
                  <div class="detail-value">${avgHumidity}%</div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">💨</div>
                <div class="detail-content">
                  <div class="detail-label">Wind</div>
                  <div class="detail-value">${avgWind} m/s</div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">🌧️</div>
                <div class="detail-content">
                  <div class="detail-label">Rain Chance</div>
                  <div class="detail-value">${maxRain}%</div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-icon">👁️</div>
                <div class="detail-content">
                  <div class="detail-label">Visibility</div>
                  <div class="detail-value">${avgVisibility} km</div>
                </div>
              </div>
            </div>
          `;

          grid.appendChild(card);
        });
      }

      function generateWeatherSVG(weatherType, iconCode) {
        const svgs = {
          sunny: `
            <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="200" fill="#87CEEB"/>
              <g class="sun">
                <circle cx="320" cy="60" r="30" fill="#FFD700"/>
                <line x1="320" y1="20" x2="320" y2="30" stroke="#FFD700" stroke-width="3"/>
                <line x1="320" y1="90" x2="320" y2="100" stroke="#FFD700" stroke-width="3"/>
                <line x1="280" y1="60" x2="290" y2="60" stroke="#FFD700" stroke-width="3"/>
                <line x1="350" y1="60" x2="360" y2="60" stroke="#FFD700" stroke-width="3"/>
              </g>
              <ellipse cx="200" cy="200" rx="250" ry="40" fill="#90EE90"/>
              <rect x="80" y="120" width="15" height="60" fill="#8B4513"/>
              <circle cx="87" cy="115" r="25" fill="#228B22"/>
              <g class="person">
                <circle cx="150" cy="155" r="8" fill="#FFE4C4"/>
                <rect x="145" y="163" width="10" height="20" fill="#4169E1" rx="2"/>
                <line x1="150" y1="183" x2="145" y2="195" stroke="#4169E1" stroke-width="3"/>
                <line x1="150" y1="183" x2="155" y2="195" stroke="#4169E1" stroke-width="3"/>
              </g>
              <g class="insect">
                <circle cx="240" cy="100" r="2" fill="#000"/>
                <ellipse cx="245" cy="100" rx="3" ry="1" fill="#000" opacity="0.3"/>
              </g>
            </svg>
          `,
          cloudy: `
            <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="200" fill="#B0C4DE"/>
              <circle cx="300" cy="50" r="25" fill="#FFD700" opacity="0.7"/>
              <g class="cloud">
                <ellipse cx="100" cy="60" rx="30" ry="20" fill="#FFF"/>
                <ellipse cx="120" cy="60" rx="35" ry="22" fill="#FFF"/>
                <ellipse cx="140" cy="60" rx="30" ry="20" fill="#FFF"/>
              </g>
              <g class="cloud" style="animation-delay: -2s">
                <ellipse cx="250" cy="80" rx="25" ry="18" fill="#FFF"/>
                <ellipse cx="270" cy="80" rx="30" ry="20" fill="#FFF"/>
                <ellipse cx="290" cy="80" rx="25" ry="18" fill="#FFF"/>
              </g>
              <rect y="170" width="400" height="30" fill="#8FBC8F"/>
              <g class="bird">
                <path d="M 50 120 Q 55 115 60 120" stroke="#333" stroke-width="2" fill="none"/>
                <path d="M 60 120 Q 65 115 70 120" stroke="#333" stroke-width="2" fill="none"/>
              </g>
            </svg>
          `,
          rainy: `
            <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="200" fill="#778899"/>
              <ellipse cx="120" cy="50" rx="40" ry="25" fill="#696969"/>
              <ellipse cx="150" cy="50" rx="45" ry="28" fill="#696969"/>
              <ellipse cx="180" cy="50" rx="40" ry="25" fill="#696969"/>
              <ellipse cx="250" cy="60" rx="35" ry="23" fill="#696969"/>
              <ellipse cx="280" cy="60" rx="40" ry="26" fill="#696969"/>
              <line class="rain" x1="130" y1="75" x2="125" y2="95" stroke="#4682B4" stroke-width="2"/>
              <line class="rain" x1="160" y1="75" x2="155" y2="95" stroke="#4682B4" stroke-width="2" style="animation-delay: 0.2s"/>
              <line class="rain" x1="190" y1="75" x2="185" y2="95" stroke="#4682B4" stroke-width="2" style="animation-delay: 0.4s"/>
              <line class="rain" x1="260" y1="85" x2="255" y2="105" stroke="#4682B4" stroke-width="2" style="animation-delay: 0.1s"/>
              <line class="rain" x1="290" y1="85" x2="285" y2="105" stroke="#4682B4" stroke-width="2" style="animation-delay: 0.3s"/>
              <rect y="170" width="400" height="30" fill="#556B2F"/>
              <g class="person">
                <g class="umbrella">
                  <path d="M 180 140 Q 180 125 180 125 Q 170 125 165 135 Q 175 140 180 140 Q 185 140 195 135 Q 190 125 180 125" fill="#DC143C"/>
                  <line x1="180" y1="125" x2="180" y2="155" stroke="#8B4513" stroke-width="2"/>
                </g>
                <circle cx="180" cy="157" r="6" fill="#FFE4C4"/>
                <rect x="176" y="163" width="8" height="15" fill="#4169E1" rx="2"/>
              </g>
              <ellipse cx="220" cy="185" rx="30" ry="5" fill="#4682B4" opacity="0.5"/>
            </svg>
          `,
          thunderstorm: `
            <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="200" fill="#2F4F4F"/>
              <ellipse cx="150" cy="40" rx="50" ry="30" fill="#36454F"/>
              <ellipse cx="190" cy="40" rx="55" ry="32" fill="#36454F"/>
              <ellipse cx="230" cy="40" rx="50" ry="30" fill="#36454F"/>
              <path class="lightning" d="M 200 70 L 190 100 L 200 100 L 185 130" stroke="#FFD700" stroke-width="3" fill="none"/>
              <line class="rain" x1="140" y1="75" x2="133" y2="100" stroke="#4682B4" stroke-width="3"/>
              <line class="rain" x1="170" y1="75" x2="163" y2="100" stroke="#4682B4" stroke-width="3" style="animation-delay: 0.15s"/>
              <line class="rain" x1="200" y1="75" x2="193" y2="100" stroke="#4682B4" stroke-width="3" style="animation-delay: 0.3s"/>
              <line class="rain" x1="230" y1="75" x2="223" y2="100" stroke="#4682B4" stroke-width="3" style="animation-delay: 0.45s"/>
              <rect y="170" width="400" height="30" fill="#3B3B3B"/>
              <rect x="80" y="135" width="12" height="45" fill="#8B4513" transform="rotate(10 86 180)"/>
              <ellipse cx="86" cy="125" rx="20" ry="15" fill="#228B22" transform="rotate(10 86 125)"/>
            </svg>
          `,
        };

        return svgs[weatherType] || svgs.cloudy;
      }

      function showLoading() {
        document.getElementById("loadingMessage").style.display = "block";
        document.getElementById("forecastGrid").style.display = "none";
      }

      function hideLoading() {
        document.getElementById("loadingMessage").style.display = "none";
      }

      function showError(message) {
        const errorDiv = document.getElementById("errorMessage");
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
      }

      function hideError() {
        document.getElementById("errorMessage").style.display = "none";
      }