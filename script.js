function errorGettingWeather() {
  document
    .getElementById('error-container')
    .insertAdjacentText('beforeend', '|| Error fetching weather data ||')
}

// Good test URL: https://api.weather.gov/points/43,-86
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

// get 7am Forecast for Temperature and return feel like temp
function handleTemperatureForecast(data) {
  const tomorrow7amForecast = getForecastForTime(data, 'T07:00')

  if (tomorrow7amForecast) {
    const temp7am = parseFloat(tomorrow7amForecast.temperature)
    const windSpeedStr = tomorrow7amForecast.windSpeed
    const wind7am = parseFloat(windSpeedStr.split(' ')[0])
    // Calculating the feel-like temperature using the WCT formula from NWS
    const feelLikeTemp =
      35.74 +
      0.6215 * temp7am -
      35.75 * wind7am ** 0.16 +
      0.4275 * temp7am * wind7am ** 0.16
    updateElementValue('temp', feelLikeTemp.toFixed(0))
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
          console.log(forecastData)
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

// Get weather
document
  .querySelector('#get-forecast-form')
  .addEventListener('submit', function (event) {
    document.querySelector('#error-container').innerHTML = ''
    event.preventDefault()
    getWeather()
  })

// Submit for SnowDay calculation
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('calculator-form')
  form.addEventListener('submit', handleFormSubmit)
})

async function handleFormSubmit(e) {
  e.preventDefault()

  try {
    const formData = getFormData(e.target)
    const data = await fetchData('/calc', formData)
    updateModal(data)
  } catch (error) {
    console.error('Error during operation: ', error)
    showErrorModal()
  }

  showModal('resultModal')
}

function getFormData(form) {
  return new URLSearchParams(new FormData(form)).toString()
}

async function fetchData(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return await response.json()
}

function updateModal(data) {
  const modalBody = document.getElementById('modalBody')
  let returnValue = ''

  if (data.result < 1) returnValue = 'less than 1%'
  else if (data.result > 99) returnValue = '99%'
  else returnValue = `${data.result}%`

  modalBody.innerText = 'Chance of Snow Day: ' + returnValue
  modalBody.className = 'modal-body text-center font-weight-bold'
}

function showErrorModal() {
  const modalBody = document.getElementById('modalBody')
  modalBody.innerText = 'Error calculating Snow Day'
  modalBody.className = 'modal-body text-center font-weight-bold text-danger'
}

function showModal(modalId) {
  var resultModal = new bootstrap.Modal(document.getElementById(modalId))
  resultModal.show()
}
