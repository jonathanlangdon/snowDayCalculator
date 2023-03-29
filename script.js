let latitude = 0;
let longitude = 0;

function getCoordinates(zipCode) {
  const mapsKey = "AIzaSyBDTl65SgR2nqysCNCzlE5fiGikIRjDc98";
  //https://console.cloud.google.com/apis --> get key for API here
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${mapsKey}`;
  console.log(geocodeUrl);
  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      const location = data.results[0].geometry.location;
      console.log(location);
      latitude = location.lat;
      longitude = location.lng;
      console.log(latitude);
      console.log(longitude);
    })
    .catch(error => {
      console.error("Error fetching location data:", error);
      document.getElementById("temp-tomorrow").textContent = "Error fetching location data";
    });
};
    

function getWeather(funLatitude,funLongitude) {
  //https://www.weather.gov/documentation/services-web-api  --> documentation for this API
  const weatherUrl = `https://api.weather.gov/points/${funLatitude},${funLongitude}`;
  fetch(weatherUrl, {
    headers: {
      "User-Agent": "calvaryeagles.org (langdon@calvaryeagles.org)"
    }
  })
  .then(response => response.json())
  .then(data => {
    const forecastHourlyUrl = data.properties.forecastHourly;
    console.log(forecastHourlyUrl);
    fetch(forecastHourlyUrl, {
      headers: {
        "User-Agent": "calvaryeagles.org (langdon@calvaryeagles.org)"
      }
    })
    .then(response => response.json())
    .then(data => {
      const tomorrow7amForecast = data.properties.periods.find(period => {
        return period.startTime.includes("T07:00");
      });
      console.log(tomorrow7amForecast);
      if (tomorrow7amForecast) {
        document.getElementById("temp-tomorrow").textContent = `Temperature at 7am tomorrow: ${tomorrow7amForecast.temperature} °F`;
      } else {
        document.getElementById("temp-tomorrow").textContent = "No forecast available for 7am tomorrow";
      }
      const tomorrow5amForecast = data.properties.periods.find(period => {
        return period.startTime.includes("T05:00");
      });
      console.log(tomorrow5amForecast);
      if (tomorrow5amForecast) {
        document.getElementById("precip-chance").textContent = `Precipitation at 5am: ${tomorrow5amForecast.probabilityOfPrecipitation.value} %`;
      } else {
        document.getElementById("precip-chance").textContent = "No forecast available for 5am tomorrow";
      }
    })
  })
  .catch(error => {
    console.error("Error fetching weather data:", error);
    document.getElementById("temp-tomorrow").textContent = "Error fetching weather data";
  });

}
  
const zipForm = document.querySelector("#zip-form");
zipForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const zipCode = document.querySelector("#zip-code").value;
  getCoordinates(zipCode);
  getWeather(latitude,longitude);
});

  // Get the button element
  const locationBtn = document.querySelector("#location-btn");

  locationBtn.addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          getWeather(latitude, longitude);
        },
        error => {
          console.error("Error getting location:", error);
          document.getElementById("temp-tomorrow").textContent = "Error getting location";
        }
      );
    } else {
      console.log("Geolocation is not supported by your browser.");
    }
  });
  