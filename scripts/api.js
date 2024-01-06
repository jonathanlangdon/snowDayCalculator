// Good test URL for API: https://api.weather.gov/points/43,-86
// Forecast URL: https://api.weather.gov/gridpoints/GRR/30,48/forecast
// Alert URL test: https://api.weather.gov/alerts/active?point=43,-86
export function getWeatherUrl() {
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  return [
    `https://api.weather.gov/points/${latitude},${longitude}`,
    `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`
  ];
}
