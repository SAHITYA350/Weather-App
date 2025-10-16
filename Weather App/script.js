const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");
const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const forecastItemsContainer = document.querySelector(".forecast-items-container");

const apiKey = '5b2bdc285bd4fd44e50cd611a25e703b';


searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});


cityInput.addEventListener("keydown", (e) => {
  if (e.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});


async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}


function getweatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  if (id <= 804) return 'clouds.svg';
  return 'clouds.svg';
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  return currentDate.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
  try {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != '200') {
      showDisplaySection(notFoundSection);
      return;
    }

    const {
      name: country,
      main: { temp, humidity },
      weather: [{ id, main }],
      wind: { speed }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + '°C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/s';
    weatherSummaryImg.src = `assets/weather/${getweatherIcon(id)}`;
    currentDateTxt.textContent = getCurrentDate();

    await updateForecastInfo(city);
    showDisplaySection(weatherInfoSection);
  } catch (error) {
    console.error("Error fetching weather:", error);
    showDisplaySection(notFoundSection);
  }
}


async function updateForecastInfo(city) {
  try {
    const forecastsData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';

    forecastsData.list.forEach(forecastWeather => {
      if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
        createForecastItem(forecastWeather);
      }
    });
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

function createForecastItem(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp }
  } = weatherData;

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date regular-txt">${formattedDate}</h5>
      <img src="assets/weather/${getweatherIcon(id)}" class="forecast-item-img">
      <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
  `;

  forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
  section.style.display = 'flex';
}
