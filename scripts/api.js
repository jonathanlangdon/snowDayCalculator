// get 7am Forecast for Temperature and return feel like temp
export function handleTemperatureForecast(data) {
  const tomorrow7amForecast = data.properties.periods.find(period =>
    period.startTime.includes('T07:00')
  )
  if (tomorrow7amForecast) {
    const temp7am = parseFloat(tomorrow7amForecast.temperature)
    const windSpeedStr = tomorrow7amForecast.windSpeed
    const wind7am = parseFloat(windSpeedStr.split(' ')[0])
    // Calculating the feel-like temperature using the WCT formula from NWS
    const feelLikeTemp = (
      35.74 +
      0.6215 * temp7am -
      35.75 * wind7am ** 0.16 +
      0.4275 * temp7am * wind7am ** 0.16
    ).toFixed(0)
    document.getElementById('temp').value = feelLikeTemp
    console.log(`Tomorrow Feel-like: ${feelLikeTemp}`)
  } else {
    document.getElementById('temp').value = ''
    displayError('|| No forecast available for 7am tomorrow ||')
  }
}
