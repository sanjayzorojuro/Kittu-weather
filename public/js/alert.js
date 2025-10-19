 const cityName = localStorage.getItem("selectedCity") || "chennai";
      document.getElementById("currentCity").textContent = cityName;

      async function fetchWeatherAlerts(city) {
        try {
          const apiKey = "6dd144367162ab13fb56cac4972ea682";
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
          );
          const data = await response.json();
          // Force-test data for high alert
          //data.main.temp = 320; // Kelvin = ~47°C
          //data.wind.speed = 20;
          //data.weather = [
          //  { main: "Storm", description: "Severe thunderstorm" },
          //];

          const alertGrid = document.getElementById("alertGrid");
          alertGrid.innerHTML = "";

          // Determine alert level
          let alertLevel = "Normal";
          let badgeClass = "badge-watch";
          const tempC = data.main.temp - 273.15;
          const wind = data.wind.speed;
          const weatherMain = data.weather[0].main.toLowerCase();

          // Safety tip and emoji variables
          let safetyTip = "";
          let emoji = "";

          if (
            tempC > 40 ||
            wind > 15 ||
            weatherMain.includes("storm") ||
            weatherMain.includes("rain")
          ) {
            alertLevel = "High Alert";
            badgeClass = "badge-severe";
            if (weatherMain.includes("storm") || weatherMain.includes("rain")) {
              emoji = "🌩️";
              safetyTip =
                "Severe weather alert — Stay indoors, avoid open areas and power lines.";
            } else if (tempC > 40) {
              emoji = "☀️";
              safetyTip =
                "High Heat Warning — Stay hydrated and avoid outdoor activities between 12–4 PM.";
            } else if (wind > 15) {
              emoji = "💨";
              safetyTip =
                "High Wind Alert — Secure loose items and avoid driving two-wheelers.";
            }
          } else if (tempC > 35 || wind > 10) {
            alertLevel = "Moderate Alert";
            badgeClass = "badge-moderate";
            emoji = "⚠️";
            safetyTip =
              "Moderate Alert — Keep an eye on weather updates and plan accordingly.";
          } else {
            alertLevel = "Normal";
            badgeClass = "badge-watch";
            emoji = "✅";
            safetyTip = "All clear — No major weather risks right now.";
          }

          const alertCard = document.createElement("div");
          alertCard.className = "alert-card";
          if (alertLevel === "High Alert")
            alertCard.classList.add("high-alert");

          alertCard.innerHTML = `
        <div class="alert-header">
          <div class="alert-type">🌦️ Weather Update for ${city}</div>
          <div class="alert-badge ${badgeClass}">${alertLevel.toUpperCase()}</div>
        </div>
        <div class="alert-location">📍 ${city}</div>
        <div class="alert-times">Updated: ${new Date().toLocaleString()}</div>
        <div class="alert-description">
          Current Temperature: ${tempC.toFixed(1)}°C<br>
          Weather: ${data.weather[0].description}<br>
          Humidity: ${data.main.humidity}%<br>
          Wind Speed: ${data.wind.speed} m/s
        </div>
        <div class="alert-safety-tip" style="
            margin-top: 15px;
            padding: 12px 16px;
            border-radius: 12px;
            background: rgba(220, 38, 38, 0.05);
            border-left: 4px solid ${
              alertLevel === "High Alert"
                ? "#dc2626"
                : alertLevel === "Moderate Alert"
                ? "#f59e0b"
                : "#16a34a"
            };
            font-weight: 500;
            color: ${
              alertLevel === "High Alert"
                ? "#dc2626"
                : alertLevel === "Moderate Alert"
                ? "#b45309"
                : "#15803d"
            };
          ">
          ${emoji} ${safetyTip}
        </div>
      `;

          alertGrid.appendChild(alertCard);
        } catch (error) {
          console.error("Error fetching alerts:", error);
          document.getElementById(
            "alertGrid"
          ).innerHTML = `<p style="text-align:center;">Unable to fetch alerts for ${city}.</p>`;
        }
      }

      fetchWeatherAlerts(cityName);