  const API_KEY = "a8330c5c1dcacb3c51053fbb1d93c39f";

    const map = L.map("map").setView([20, 0], 2);

    const baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let currentLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      { opacity: 0.6 }
    ).addTo(map);

    let currentMarker = null;

    // Add click event to map
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;

      if (currentMarker) {
        map.removeLayer(currentMarker);
      }

      currentMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>Loading weather data...</b><br>Lat: ${lat.toFixed(2)}<br>Lon: ${lng.toFixed(2)}`)
        .openPopup();

      showLoading();

      // Fetch weather data for clicked location
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const cityName = data.name || 'Unknown Location';
          const country = data.sys.country || '';

          currentMarker.setPopupContent(`<b>${cityName}${country ? ', ' + country : ''}</b><br>Lat: ${lat.toFixed(2)}<br>Lon: ${lng.toFixed(2)}`);

          document.getElementById("weatherCity").textContent = cityName + (country ? ', ' + country : '');
          document.getElementById("weatherTemp").textContent = `${Math.round(data.main.temp)}°C`;
          document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
          document.getElementById("humidity").textContent = `${data.main.humidity}%`;
          document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
          document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
          document.getElementById("weatherInfo").classList.add("active");
          hideLoading();
        })
        .catch(err => {
          console.error("Weather data error:", err);
          hideLoading();
          alert("Error fetching weather data for this location!");
        });
    });

    document.getElementById("layerSelect").addEventListener("change", (e) => {
      map.removeLayer(currentLayer);
      const selected = e.target.value;
      currentLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/${selected}/{z}/{x}/{y}.png?appid=${API_KEY}`,
        { opacity: 0.6 }
      ).addTo(map);
    });

    function showLoading() {
      document.getElementById("loading").classList.add("active");
    }

    function hideLoading() {
      document.getElementById("loading").classList.remove("active");
    }

    function fetchWeatherData(lat, lon, cityName, country) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("weatherCity").textContent = `${cityName}, ${country}`;
          document.getElementById("weatherTemp").textContent = `${Math.round(data.main.temp)}°C`;
          document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
          document.getElementById("humidity").textContent = `${data.main.humidity}%`;
          document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
          document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
          document.getElementById("weatherInfo").classList.add("active");
          hideLoading();
        })
        .catch(err => {
          console.error("Weather data error:", err);
          hideLoading();
        });
    }

    document.getElementById("search").addEventListener("click", () => {
      const city = document.getElementById("city").value.trim();
      if (!city) return alert("Please enter a city name!");

      showLoading();

      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            alert("City not found!");
            hideLoading();
            return;
          }
          const { lat, lon, name, country } = data[0];
          map.setView([lat, lon], 10);

          if (currentMarker) {
            map.removeLayer(currentMarker);
          }

          currentMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${name}, ${country}</b><br>Lat: ${lat.toFixed(2)}<br>Lon: ${lon.toFixed(2)}`)
            .openPopup();

          fetchWeatherData(lat, lon, name, country);
        })
        .catch(err => {
          alert("Error fetching city data!");
          hideLoading();
        });
    });

    document.getElementById("city").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("search").click();
      }
    });

    document.getElementById("closeWeather").addEventListener("click", () => {
      document.getElementById("weatherInfo").classList.remove("active");
    });