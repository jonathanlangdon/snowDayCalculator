function errorGettingWeather() {
  document
    .getElementById('error-container')
    .insertAdjacentText('beforeend', '|| Error fetching weather data ||')
}

function getWeatherUrl() {
  const latitude = document.querySelector('#latitude').value
  const longitude = document.querySelector('#longitude').value
  return `https://api.weather.gov/points/${latitude},${longitude}`
}

function fetchWeatherData(url) {
  return fetch(url).then(response => response.json())
}

function getForecastForTime(data, time) {
  return data.properties.periods.find(period => period.startTime.includes(time))
}

function updateElementValue(elementId, value) {
  document.getElementById(elementId).value = value
}

function displayError(message) {
  document
    .getElementById('error-container')
    .insertAdjacentText('beforeend', message)
}

// get 7am Forecast for Temperature
function handleTemperatureForecast(data) {
  const tomorrow7amForecast = getForecastForTime(data, 'T07:00')

  if (tomorrow7amForecast) {
    updateElementValue('temp', tomorrow7amForecast.temperature)
  } else {
    updateElementValue('temp', '')
    displayError('|| No forecast available for 7am tomorrow ||')
  }
}

// get 5am Forecast for Precipitation
function handlePrecipitationForecast(data) {
  const tomorrow5amForecast = getForecastForTime(data, 'T05:00')

  if (tomorrow5amForecast) {
    updateElementValue(
      'precip',
      tomorrow5amForecast.probabilityOfPrecipitation.value
    )
  } else {
    updateElementValue('precip', '')
    displayError('|| No forecast available for 5am tomorrow ||')
  }
}

function handleForecastHourly(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      handleTemperatureForecast(data)
      handlePrecipitationForecast(data)
    })
}

function handleSnow(data, day, container) {
  const forecastOfDay = data.properties.periods[day]

  if (forecastOfDay) {
    const forecastDescription = forecastOfDay.detailedForecast
    const regex = /\b(\d+(\.\d+)?)\s*(inch|inches)\b/
    const match = forecastDescription.match(regex)
    document.querySelector(container).value = match ? parseFloat(match[1]) : 0
  } else {
    errorGettingWeather()
  }
}

function getWeather() {
  const weatherUrl = getWeatherUrl()
  fetchWeatherData(weatherUrl)
    .then(initialData => {
      const forecastHourlyUrl = initialData.properties.forecastHourly
      const forecastUrl = initialData.properties.forecast
      return fetchWeatherData(forecastUrl)
        .then(forecastData => {
          handleSnow(forecastData, 0, '#snow-today')
          handleSnow(forecastData, 1, '#snow-tomorrow')
        })
        .then(() => {
          return forecastHourlyUrl
        })
    })
    .then(forecastHourlyUrl => {
      return handleForecastHourly(forecastHourlyUrl)
    })
    .catch(error => {
      console.error('Error fetching weather data:', error)
      errorGettingWeather()
    })
}

document
  .querySelector('#get-forecast-form')
  .addEventListener('submit', function (event) {
    document.querySelector('#error-container').innerHTML = ''
    event.preventDefault()
    getWeather()
  })

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('calculator-form')
  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    const snowToday = parseFloat(document.getElementById('snow-today').value)
    const snowTomorrow = parseFloat(
      document.getElementById('snow-tomorrow').value
    )
    const precip = parseFloat(document.getElementById('precip').value)
    const temp = parseFloat(document.getElementById('temp').value)
    const response = await fetch('http://your-server-address:5000/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ snowToday, snowTomorrow, precip, temp })
    })
    const data = await response.json()
    alert('Chance of Snow Day: ' + data.result)
  })
})
