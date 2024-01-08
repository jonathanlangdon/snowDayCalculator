export function displayError(message) {
  document.getElementById('forecast-error').innerText = message;
}

export function errorGettingWeather() {
  const errorMessage =
    'Error fetching weather data. Please check your internet connection or try again later.';
  displayError(errorMessage);
}
