function getWeather(zipCode) {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=AIzaSyBDTl65SgR2nqysCNCzlE5fiGikIRjDc98`;
    fetch(geocodeUrl)
      .then(response => response.json())
      .then(data => {
        const location = data.results[0].geometry.location;
        console.log(location);
        const weatherUrl = `https://api.weather.gov/points/${location.lat},${location.lng}`;
        fetch(weatherUrl, {
          headers: {
            'User-Agent': 'calvaryeagles.org (langdon@calvaryeagles.org)'
          }
        })
          .then(response => response.json())
          .then(data => {
            const tomorrow7amForecast = data.properties.periods.find(period => {
              const date = new Date(period.startTime);
              return date.getDate() === (new Date().getDate() + 1) && date.getHours() === 7;
            });
            if (tomorrow7amForecast) {
              document.getElementById('temp-tomorrow').textContent = `Temperature at 7am tomorrow: ${tomorrow7amForecast.temperature} °F`;
            } else {
              document.getElementById('temp-tomorrow').textContent = 'No forecast available for 7am tomorrow';
            }
          })
          .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('temp-tomorrow').textContent = 'Error fetching weather data';
          });
      })
      .catch(error => {
        console.error('Error fetching location data:', error);
        document.getElementById('temp-tomorrow').textContent = 'Error fetching location data';
      });
  }
  
  const zipForm = document.querySelector('#zip-form');
  zipForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const zipCode = document.querySelector('#zip-code').value;
    getWeather(zipCode);
  });