// Good test URL for API: https://api.weather.gov/points/43,-86
// Forecast URL: https://api.weather.gov/gridpoints/GRR/30,48/forecast
// Hourly Forecast URL: https://api.weather.gov/gridpoints/GRR/30,48/forecast/hourly
// Alert URL test: https://api.weather.gov/alerts/active?point=43,-86

export function getWeatherUrl() {
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  return [
    `https://api.weather.gov/points/${latitude},${longitude}`,
    `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`
  ];
}

export function getFeelLikeTemp(data) {
  const tomorrow7amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T07:00')
  );
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
  return feelLikeTemp;
}
