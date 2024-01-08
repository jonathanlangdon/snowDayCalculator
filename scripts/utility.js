export function displayError(message) {
  document.getElementById('forecast-error').innerText = message;
}

export function errorGettingWeather() {
  const errorMessage =
    'Error fetching weather data. Please check try again later.';
  displayError(errorMessage);
}
