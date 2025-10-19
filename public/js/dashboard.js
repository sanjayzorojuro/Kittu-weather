// Example dashboard.js - Shows how to use the new API endpoints

const API_KEY = '6dd144367162ab13fb56cac4972ea682';

// Function to get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    // Use the server proxy endpoint
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Function to get weather by city name
async function getWeatherByCity(cityName) {
  try {
    const response = await fetch(`/api/weather?q=${encodeURIComponent(cityName)}`);
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

// Function to get 5-day forecast
async function getForecast(lat, lon) {
  try {
    const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
    
    if (!response.ok) {
      throw new Error('Forecast data fetch failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

// Function to geocode city name to coordinates
async function geocodeCity(cityName) {
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(cityName)}`);
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error geocoding city:', error);
    throw error;
  }
}

// Get weather icon emoji based on weather condition
function getWeatherIcon(weatherMain) {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  return icons[weatherMain] || '🌤️';
}

// Update UI with weather data
function updateWeatherUI(data) {
  document.getElementById('location').textContent = `📍 ${data.name}, ${data.sys.country}`;
  document.getElementById('weatherIcon').textContent = getWeatherIcon(data.weather[0].main);
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById('pressure').textContent = `${data.main.pressure} mb`;
  document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
  
  // Get wind direction
  const windDeg = data.wind.deg;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(windDeg / 45) % 8;
  document.getElementById('windDirection').textContent = directions[index];
}

// Initialize on page load
async function init() {
  // Get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Fetch current weather
          const weatherData = await getWeatherByCoords(latitude, longitude);
          updateWeatherUI(weatherData);
          
          // Fetch forecast
          const forecastData = await getForecast(latitude, longitude);
          updateForecastUI(forecastData);
        } catch (error) {
          console.log('Error:',error);
          const errormeselement=document.getElementById('errorMessage')

          errormeselement.textContent='Unable to find the city,Please try again.'
          errormeselement.style.display='block'

          setTimeout(() => {
            errormeselement.textContent="";
            errormeselement.style.display='none';
          }, 3000);

        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Default to a city if geolocation fails
        fetchWeatherByCity('London');
      }
    );
  } else {
    // Fallback if geolocation not supported
    fetchWeatherByCity('London');
  }
}

// Fetch weather by city name
async function fetchWeatherByCity(cityName) {
  try {
    const weatherData = await getWeatherByCity(cityName);
    updateWeatherUI(weatherData);
    
    // Fetch forecast
    const forecastData = await getForecast(weatherData.coord.lat, weatherData.coord.lon);
    updateForecastUI(forecastData);
  } catch (error) {
    console.error('Error:', error);
    const ER=document.getElementById('errorMessage');
    ER.textContent= `Unable to fetch weather data for ${cityName}. Please try another city.`;
    ER.style.color= "red"
    ER.style.display="bold"
      setTimeout(() => {
        document.getElementById('errorMessage').textContent=" ";
      }, 3000);
  }
}

// Update forecast UI (implement based on your needs)
function updateForecastUI(data) {
  // Extract hourly forecast for next 24 hours
  const hourlyData = data.list.slice(0, 8); // 8 intervals = 24 hours (3-hour intervals)
  
  const forecastContainer = document.getElementById('hourlyForecast');
  forecastContainer.innerHTML = '';
  
  hourlyData.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const hours = date.getHours();
    const temp = Math.round(forecast.main.temp);
    const icon = getWeatherIcon(forecast.weather[0].main);
    
    const forecastHTML = `
      <div class="boxxex">
        <div class="boxx">
          <div class="time-label">${hours}:00</div>
          <div class="forecast-icon">${icon}</div>
          <div class="forecast-temp">${temp}°</div>
        </div>
      </div>
    `;
    
    forecastContainer.innerHTML += forecastHTML;
  });
  
  // Update temperature chart
  updateTempChart(hourlyData);
}

// Update temperature chart
function updateTempChart(hourlyData) {
  const chartContainer = document.getElementById('tempChart');
  chartContainer.innerHTML = '';
  
  const temps = hourlyData.map(d => d.main.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const range = maxTemp - minTemp || 1;
  
  temps.forEach(temp => {
    const height = ((temp - minTemp) / range) * 100;
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${height}%`;
    bar.title = `${Math.round(temp)}°C`;
    chartContainer.appendChild(bar);
  });
}

// Search functionality
const cityInput = document.getElementById('cityInput');
if (cityInput) {
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = cityInput.value.trim();
      if (city) {
        fetchWeatherByCity(city);
      }
    }
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}