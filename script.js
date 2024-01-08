import { getWeatherUrl } from './scripts/api.js';
import { displayError, errorGettingWeather } from './scripts/utility.js';

// get 7am Forecast for Temperature and return feel like temp
function handleTemperatureForecast(data) {
  const tomorrow7amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T07:00')
  );
  if (tomorrow7amForecast) {
    const temp7am = parseFloat(tomorrow7amForecast.temperature);
    const windSpeedStr = tomorrow7amForecast.windSpeed;
    const wind7am = parseFloat(windSpeedStr.split(' ')[0]);
    // Calculating the feel-like temperature using the WCT formula from NWS
    const feelLikeTemp = (
      35.74 +
      0.6215 * temp7am -
      35.75 * wind7am ** 0.16 +
      0.4275 * temp7am * wind7am ** 0.16
    ).toFixed(0);
    document.getElementById('temp').value = feelLikeTemp;
    console.log(`Tomorrow Feel-like: ${feelLikeTemp}`);
  } else {
    document.getElementById('temp').value = '';
    displayError('|| No forecast available for 7am tomorrow ||');
  }
}

// get 5am Forecast for Precipitation
function handlePrecipitationForecast(data) {
  const tomorrow5amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T05:00')
  );
  if (tomorrow5amForecast) {
    document.getElementById('precip').value =
      tomorrow5amForecast.probabilityOfPrecipitation.value;
  } else {
    document.getElementById('precip').value = '';
    displayError('|| No forecast available for 5am tomorrow ||');
  }
}

// get number of inches of snow
function handleSnow(data, day, container) {
  const dayType = day === 'today' ? 0 : 1;
  let forecastOfDay = data.properties.periods[dayType];
  let tonightHasForecast = false;

  if (data.properties.periods[1].name === 'Tonight') {
    tonightHasForecast = true;
    if (day === 'tomorrow') {
      forecastOfDay = data.properties.periods[2];
    }
  }

  if (forecastOfDay.detailedForecast) {
    const minInchesRegex = /(\d+)\s*to\s*\d+\s*(?:inch|inches)\b/;
    let matchArray = forecastOfDay.detailedForecast.match(minInchesRegex);

    if (matchArray && matchArray.length > 1) {
      let match = parseInt(matchArray[1]);

      if (day === 'today' && tonightHasForecast) {
        let tonightMatchArray =
          data.properties.periods[1].detailedForecast.match(minInchesRegex);
        if (tonightMatchArray && tonightMatchArray.length > 1) {
          const tonightInches = parseInt(tonightMatchArray[1]);
          console.log(`tonight's inches are ${tonightInches}`);
          match += tonightInches;
          console.log(`today's inches (including tonight) is now ${match}`);
        }
      }
      document.querySelector(container).value = match;
      console.log(
        `Forecast has minimum of snow of ${match} for ${forecastOfDay.name}`
      );
    } else {
      document.querySelector(container).value = 0;
      console.log(
        `No inches of snow found in detailedForecast for ${forecastOfDay.name}`
      );
    }
  } else {
    console.log('forecastOfDay.detailedForecast is null or undefined.');
    errorGettingWeather();
  }
}

async function fetchDataWithRetry(url, maxRetries = 15, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    if (i >= 10) {
      console.log('Error fetching API data');
      errorGettingWeather();
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      if (i < maxRetries - 1) await new Promise(res => setTimeout(res, delay));
      else throw error;
    }
  }
}

async function handleForecastHourly(url) {
  try {
    const data = await fetchDataWithRetry(url);
    handleTemperatureForecast(data);
    handlePrecipitationForecast(data);
  } catch (error) {
    console.error('Error fetching hourly weather data:', error);
    errorGettingWeather();
  }
}

function tomorrowDecisionTime(currentTime) {
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(currentTime.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);
  return tomorrow;
}

async function handleAlert(url) {
  try {
    const data = await fetchDataWithRetry(url);
    if (!data.features[0]) return;
    const alertText = data.features[0].properties;
    const expirationTime = new Date(alertText.ends);
    const currentTime = new Date();

    tomorrow = tomorrowDecisionTime(currentTime);

    if (expirationTime > tomorrow) {
      if (alertText.headline.match(/.*(winter).*(warning).*/i)) {
        document.getElementById('warning').checked = true;
      } else if (alertText.headline.match(/.*(winter).*(advisory).*/i)) {
        document.getElementById('advisory').checked = true;
      }
    } else {
      document.getElementById('no-alert').checked = true;
    }
    console.log(`Alert: ${alertText.headline}`);
  } catch (error) {
    console.error('Error fetching alert data:', error);
    errorGettingWeather();
  }
}

async function getWeather(e) {
  e.preventDefault();
  document.getElementById('forecast-error').innerText = '';
  calcWaitingMessage();
  const Urls = getWeatherUrl();
  const weatherUrl = Urls[0];
  const alertUrl = Urls[1];
  try {
    const initialData = await fetchDataWithRetry(weatherUrl);
    const forecastHourlyUrl = initialData.properties.forecastHourly;
    const forecastUrl = initialData.properties.forecast;

    const forecastData = await fetchDataWithRetry(forecastUrl);
    handleSnow(forecastData, 'today', '#snow-today');
    handleSnow(forecastData, 'tomorrow', '#snow-tomorrow');

    await handleForecastHourly(forecastHourlyUrl);
  } catch (error) {
    console.error('Error fetching overall weather data:', error);
    errorGettingWeather();
  } finally {
    document.getElementById('loading-message').style.display = 'none';
  }
  await handleAlert(alertUrl);
  document.getElementById('calculate-snow').click();
}

function returnRandomWaitMessage() {
  const snowDayMessages = [
    'Measuring snow flakes...',
    "Contacting Santa's Elves...",
    'Putting thumb in air...',
    'Consulting the penguins...',
    "Synchronizing with the Yeti's calendar...",
    "Cross-referencing with Frosty's schedule...",
    'Chilling the algorithms...',
    'Knitting some code into a winter scarf...',
    'Ice-proofing the results...',
    'Tuning into the polar forecast...',
    'Shaking the snow globe for answers...',
    'Gathering intel from the igloos...',
    'Cozying up to the data fireside...',
    'Brewing a hot chocolate calculation...',
    'Asking the magic snowball...',
    'Consulting the snow elves...',
    'Warming up the number cruncher...',
    'Slipping and sliding through data...',
    'Commissioning the snow plows...',
    'Whistling for the northern winds...',
    "Checking the squirrel's nut stockpile...",
    'Waking up the hibernating algorithms...',
    'Defrosting the prediction engine...',
    'Waiting for the snowman to nod...',
    'Deciphering the snowflake patterns...',
    "Interpreting the Aurora Borealis' opinion...",
    'Zamboni-ing the data lake...',
    'Building an igloo of possibilities...'
  ];
  return snowDayMessages[Math.floor(Math.random() * snowDayMessages.length)];
}

function calcWaitingMessage() {
  document.getElementById('below-calculator-div').innerText =
    returnRandomWaitMessage();
  setTimeout(function () {
    document.getElementById('below-calculator-div').innerText = '';
  }, 10000);
}

function showCalcFactors() {
  try {
    const todaySnow = parseInt(document.getElementById('snow-today').value);
    const tomorrowSnow = parseInt(
      document.getElementById('snow-tomorrow').value
    );
    const totalSnow = todaySnow + tomorrowSnow;
    const temp7am = document.getElementById('temp').value;
    const alert = document.querySelector('input[name="alert"]:checked').value;
    const snowFactor = `, a possible ${totalSnow} inches of snow`;
    const tempFactor = `, a feel-like temp of ${temp7am} degrees`;
    const snowText = `${totalSnow > 0 ? snowFactor : ''}`;
    const tempText = `${temp7am < 0 ? tempFactor : ''}`;
    const nonAlertFactors = snowText + tempText;
    let calcFactors =
      'Key Factor: There is no Winter Weather Alert for tomorrow';
    if (alert !== 'none') {
      calcFactors = `Key Factors: There is a Winter Weather ${alert}${nonAlertFactors}`;
    }
    const modalTarget = document.getElementById('calc-factors');
    console.log(calcFactors);
    modalTarget.textContent = calcFactors;
  } catch (error) {
    console.error('Error during operation: ', error);
    showErrorModal();
  }
}

async function handleSnowSubmit(e) {
  e.preventDefault();
  try {
    const formData = getFormData(e.target);
    const data = await fetchData('/calc', formData);
    updateModal(data);
  } catch (error) {
    console.error('Error during operation: ', error);
    showErrorModal();
  }
  showCalcFactors();
  showModal('resultModal');
  setTimeout(
    () => (document.getElementById('below-calculator-div').innerText = ''),
    2000
  );
}

function getFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

async function fetchData(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
}

function updateModal(data) {
  const modalBody = document.getElementById('chance-calculation');
  let returnValue = '';
  if (data.result < 1) returnValue = 'Less than 1%';
  else if (data.result > 99) returnValue = '99%';
  else returnValue = `${data.result}%`;
  modalBody.innerText = returnValue;

  const textResult = document.getElementById('text-interpretation');
  if (data.result < 16) {
    textResult.innerText = 'Really not likely';
  } else if (data.result < 36) {
    textResult.innerText = 'Not likely';
  } else if (data.result < 51) {
    textResult.innerText = 'Slight chance';
  } else if (data.result < 71) {
    textResult.innerText = 'Decent chance';
  } else if (data.result < 86) {
    textResult.innerText = 'Good chance';
  } else if (data.result < 99) {
    textResult.innerText = 'High chance';
  } else if (data.result >= 99) {
    textResult.innerText = 'Pack your snow pants';
  }
}

function showErrorModal() {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerText = 'Unexpected Error calculating Snow Day';
  modalBody.className = 'modal-body text-center font-weight-bold text-danger';
}

function showModal(modalId) {
  const resultModal = new bootstrap.Modal(document.getElementById(modalId));
  resultModal.show();
}

// Use previously obtained location
function usePreviousLocation() {
  const formLatitude = document.getElementById('latitude');
  const formLongitude = document.getElementById('longitude');
  const prevLocationText = document.getElementById('prev-location-text');
  const changeLocationLink = document.getElementById('change-location-link');
  const locationServices = document.querySelectorAll('.location-services');

  if (localStorage.latitude && localStorage.longitude) {
    formLatitude.value = localStorage.latitude;
    formLongitude.value = localStorage.longitude;
    locationServices.forEach(x => (x.style.display = 'none'));
    prevLocationText.style.display = 'block';
  } else {
    formLatitude.value = 43.144;
    formLongitude.value = -86.17;
    locationServices.forEach(x => (x.style.display = 'block'));
    prevLocationText.style.display = 'none';
  }

  changeLocationLink.addEventListener('click', function (e) {
    e.preventDefault();
    locationServices.forEach(x => (x.style.display = 'block'));
    prevLocationText.style.display = 'none';
    changeLocationLink.style.display = 'none';
  });
}

function successLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  document.getElementById('latitude').value = latitude;
  document.getElementById('longitude').value = longitude;
  const saveAgree = document.getElementById('save-agree').checked;
  if (saveAgree) {
    localStorage.setItem('latitude', latitude);
    localStorage.setItem('longitude', longitude);
    console.log(
      'Local Storage has been agreed to and geolocation has been saved'
    );
  }
}

function errorLocation(error) {
  console.log(`Error: ${error.code} - ${error.message}`);
}

const locationOptions = {
  timeout: 5000
};

function getUserLocation(e) {
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(
    successLocation,
    errorLocation,
    locationOptions
  );
}

function init() {
  usePreviousLocation();

  const locationGetBtn = document.getElementById('location-getter');
  locationGetBtn.addEventListener('submit', getUserLocation);

  const forecastGetBtn = document.getElementById('get-forecast-form');
  forecastGetBtn.addEventListener('submit', getWeather);

  const calculateSnowBtn = document.getElementById('calculator-form');
  calculateSnowBtn.addEventListener('submit', handleSnowSubmit);
}

if (typeof module === 'undefined' || !module.exports) {
  init();
}
