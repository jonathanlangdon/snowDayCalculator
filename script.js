import { getWeatherUrl, getFeelLikeTemp } from './scripts/api.js';
import { displayError, errorGettingWeather } from './scripts/utility.js';

let SNOWTODAY = 0;
let SNOWTOMORROW = 0;
let PRECIP = 0;
let TEMP = 32;
let ALERT = 'none';

// get 5am Forecast for Precipitation
function handlePrecipitationForecast(data) {
  const tomorrow5amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T05:00')
  );
  if (tomorrow5amForecast) {
    return tomorrow5amForecast.probabilityOfPrecipitation.value;
  } else {
    displayError('|| No forecast available for 5am tomorrow ||');
  }
}

// get number of inches of snow
function getInchesSnow(data) {
  const forecastToday = data.properties.periods[0].detailedForecast;
  const forecastTonight = data.properties.periods[1].detailedForecast;
  let forecastTomorrow = data.properties.periods[1].detailedForecast;
  let NightHasForecast = false;
  if (data.properties.periods[1].name === 'Tonight') {
    NightHasForecast = true;
    forecastTomorrow = data.properties.periods[2].detailedForecast;
  }

  let regexTonight;
  const minInchRegex = /(\d+)\s*to\s*\d+\s*(?:inch|inches)\b/;
  if (NightHasForecast) {
    regexTonight = forecastTonight.match(minInchRegex);
  } else {
    regexTonight = 0;
  }

  if (forecastToday) {
    const regexToday = forecastToday.match(minInchRegex);
    const regexTomorrow = forecastTomorrow.match(minInchRegex);
    let inchesToday = 0;
    let inchesTonight = 0;
    if (regexToday) inchesToday = parseInt(regexToday[1]);
    if (regexTonight) inchesTonight = parseInt(regexTonight[1]);
    SNOWTODAY = inchesToday + inchesTonight;
    if (regexTomorrow) SNOWTOMORROW = parseInt(regexTomorrow[1]);
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
      if (i < maxRetries) await new Promise(res => setTimeout(res, delay));
      else throw error;
    }
  }
}

async function getHourlyForecast(url) {
  try {
    const data = await fetchDataWithRetry(url);
    TEMP = getFeelLikeTemp(data);
    PRECIP = handlePrecipitationForecast(data);
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

function tomorrowSchoolEnd(currentTime) {
  const schoolEnd = new Date(currentTime);
  schoolEnd.setDate(currentTime.getDate() + 1);
  schoolEnd.setHours(16, 0, 0, 0);
  return schoolEnd;
}

async function handleAlert(url) {
  try {
    const currentTime = new Date();
    const tomorrow = tomorrowDecisionTime(currentTime);
    const schoolEnd = tomorrowSchoolEnd(currentTime);
    const data = await fetchDataWithRetry(url);
    if (!data.features[0]) return;
    const alerts = [];
    data.features.forEach(item => {
      const itemData = {
        headline: item.properties.headline,
        onset: item.properties.onset
          ? new Date(item.properties.onset)
          : currentTime,
        endTime: item.properties.ends
          ? new Date(item.properties.ends)
          : currentTime
      };
      alerts.push(itemData);
    });

    let alertValue = 'none';
    alerts.forEach(alert => {
      console.log(alert.headline);
      if (alert.endTime > tomorrow && alert.onset < schoolEnd) {
        if (alert.headline.match(/.*(winter).*(warning|watch).*/i)) {
          alertValue = 'warning';
          return alertValue;
        } else if (alert.headline.match(/.*(winter).*(advisory).*/i)) {
          alertValue = 'advisory';
        }
      }
    });
    return alertValue;
  } catch (error) {
    console.error('Error fetching alert data:', error);
    errorGettingWeather();
  }
}

async function getAnalyzeForecast(e) {
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
    getInchesSnow(forecastData);
    await getHourlyForecast(forecastHourlyUrl);
    const newAlert = await handleAlert(alertUrl);
    ALERT = newAlert ? newAlert : 'none';
  } catch (error) {
    console.error('Error fetching overall weather data:', error);
    errorGettingWeather();
  } finally {
    document.getElementById('loading-message').style.display = 'none';
  }
  const apiData = JSON.stringify({
    snowtoday: SNOWTODAY,
    snowtomorrow: SNOWTOMORROW,
    precip: PRECIP,
    temp: TEMP,
    alert: ALERT
  });

  console.log(`Data sent to API: ${apiData}`);
  fetchSnowCalc(apiData);
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
    const totalSnow = SNOWTODAY + SNOWTOMORROW;
    const snowFactor = `, a possible ${totalSnow} inches of snow today and tomorrow`;
    const tempFactor = `, a feel-like temp of ${TEMP} degrees`;
    const snowText = `${totalSnow > 0 ? snowFactor : ''}`;
    const tempText = `${TEMP < 0 ? tempFactor : ''}`;
    const nonAlertFactors = snowText + tempText;
    let calcFactors = `Key Factors: Currently there is no Winter Weather Alert for tomorrow${nonAlertFactors}. Check again later.`;
    if (ALERT !== 'none') {
      calcFactors = `Key Factors: There is a Winter Weather ${ALERT}${nonAlertFactors}`;
    }
    const modalTarget = document.getElementById('calc-factors');
    modalTarget.textContent = calcFactors;
  } catch (error) {
    console.error('Error during operation: ', error);
    showErrorModal();
  }
}

async function fetchSnowCalc(apiData) {
  try {
    const response = await fetch('/calc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: apiData
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
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

function updateModal(data) {
  const modalBody = document.getElementById('chance-calculation');
  let returnValue = '';
  if (data.result < 1) returnValue = 'Less than 1%';
  else if (data.result > 99) returnValue = '99%';
  else returnValue = `${data.result}%`;
  modalBody.innerText = returnValue;

  const textResult = document.getElementById('text-interpretation');
  if (data.result < 15) {
    textResult.innerText = 'Not likely';
  } else if (data.result < 35) {
    textResult.innerText = 'Slight Chance';
  } else if (data.result < 50) {
    textResult.innerText = 'Some chance';
  } else if (data.result < 70) {
    textResult.innerText = 'Decent chance';
  } else if (data.result < 85) {
    textResult.innerText = 'Good chance';
  } else if (data.result < 99) {
    textResult.innerText = 'High chance';
  } else if (data.result >= 99) {
    textResult.innerText = 'Almost certain';
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

function getFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

function getUserLocation(e) {
  e.preventDefault();
  const formData = getFormData(e.target);
  console.log(`location form data: ${formData}`);
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

  const forecastGetBtn = document.getElementById('forecast-calculate-form');
  forecastGetBtn.addEventListener('submit', getAnalyzeForecast);
}

if (typeof module === 'undefined' || !module.exports) {
  init();
}
