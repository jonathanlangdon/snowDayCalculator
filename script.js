function errorGettingWeather() {
  document.querySelector('#forecast-error').innerText =
    '|| Error fetching weather data ||'
}

function displayError(message) {
  document
    .querySelector('#error-container')
    .insertAdjacentText('beforeend', message)
}

// Good test URL for API: https://api.weather.gov/points/43,-86
function getWeatherUrl() {
  const latitude = document.querySelector('#latitude').value
  const longitude = document.querySelector('#longitude').value
  return [
    `https://api.weather.gov/points/${latitude},${longitude}`,
    `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`
  ]
}

// get 7am Forecast for Temperature and return feel like temp
function handleTemperatureForecast(data) {
  const tomorrow7amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T07:00')
  )
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
    document.querySelector('#temp').value = feelLikeTemp.toFixed(0)
  } else {
    document.querySelector('#temp').value = ''
    displayError('|| No forecast available for 7am tomorrow ||')
  }
}

// get 5am Forecast for Precipitation
function handlePrecipitationForecast(data) {
  const tomorrow5amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T05:00')
  )
  if (tomorrow5amForecast) {
    document.querySelector('#precip').value =
      tomorrow5amForecast.probabilityOfPrecipitation.value
  } else {
    document.querySelector('#precip').value = ''
    displayError('|| No forecast available for 5am tomorrow ||')
  }
}

// get number of inches of snow
function handleSnow(data, day, container) {
  const forecastOfDay = data.properties.periods[day]

  if (forecastOfDay) {
    const match = forecastOfDay.detailedForecast.match(
      /\b(\d+(\.\d+)?)\s*(inch|inches)\b/
    )
    document.querySelector(container).value = match ? parseFloat(match[1]) : 0
  } else {
    errorGettingWeather()
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

// Determine what kind of weather alert is in effect
function handleAlert(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features.length !== 0) {
        if (data.features.match(/.*(winter).*(warning).*/i)) {
          document.querySelector('#warning').checked = true
        } else if (data.features.match(/.*(winter).*(advisory).*/i)) {
          document.querySelector('#advisory').checked = true
        }
      } else {
        document.querySelector('#no-alert').checked = true
      }
    })
    .catch(error => {
      console.error('Error fetching weather data:', error)
      errorGettingWeather()
    })
}

function getWeather() {
  const Urls = getWeatherUrl()
  const weatherUrl = Urls[0]
  const alertUrl = Urls[1]
  fetch(weatherUrl)
    .then(response => response.json())
    .then(initialData => {
      const forecastHourlyUrl = initialData.properties.forecastHourly
      const forecastUrl = initialData.properties.forecast
      return fetch(forecastUrl)
        .then(response => response.json())
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
  handleAlert(alertUrl)
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
  const modalBody = document.querySelector('#chance-calculation')
  let returnValue = ''
  if (data.result < 1) returnValue = 'less than 1%'
  else if (data.result > 99) returnValue = '99%'
  else returnValue = `${data.result}%`
  modalBody.innerText = returnValue

  const textResult = document.querySelector('#text-interpretation')
  if (data.result < 16) {
    textResult.innerText = 'Really not likely'
  } else if (data.result < 36) {
    textResult.innerText = 'Not likely'
  } else if (data.result < 5) {
    textResult.innerText = 'Slight chance'
  } else if (data.result < 71) {
    textResult.innerText = 'Decent chance'
  } else if (data.result < 86) {
    textResult.innerText = 'Good chance'
  } else if (data.result < 99) {
    textResult.innerText = 'High chance'
  } else if (data.result >= 99) {
    textResult.innerText = 'Count on it'
  }
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
