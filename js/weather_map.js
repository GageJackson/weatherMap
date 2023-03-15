let locationCoord = [-98.48527, 29.423017];
setPage(locationCoord);

mapboxgl.accessToken = mapboxKey;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/gagejackson/clf2s2gln001601qik4wqike1", // style URL
  zoom: 12, // starting zoom
  center: locationCoord, // [lng, lat]
});
function setPage(locationCoord) {
  $.get("http://api.openweathermap.org/data/2.5/onecall", {
    APPID: weatherKey,
    lat: locationCoord[1],
    lon: locationCoord[0],
    units: "imperial",
  }).done(function (data) {
    console.log("The entire response:", data);
    setLocationName(data);
    setWeatherTabs(data);
    setWeatherTabContent(data);
  });
}

let marker = new mapboxgl.Marker({ draggable: true })
  .setLngLat(locationCoord)
  .addTo(map);
//marker.addEventListener("dragend", newLocation);

function onDragEnd() {
  let dragCoords = marker.getLngLat();
  locationCoord = [dragCoords.lng, dragCoords.lat];
  setPage(locationCoord);
}

marker.on("dragend", onDragEnd);
map.on("click", (e) => {
  let dragCoords = e.lngLat;
  locationCoord = [dragCoords.lng, dragCoords.lat];
  marker.setLngLat(locationCoord);
  setPage(locationCoord);
});

const currentWeatherDiv = document.querySelector("#currentWeather");
const forecastedWeatherTilesDiv = document.querySelector("#forecastTiles");
const newLocationButton = document.querySelector("#btn-submit-address");
const weatherTabsDiv = document.getElementsByClassName("nav-link");
const weatherTabContentDiv = document.getElementsByClassName("tab-pane");

newLocationButton.addEventListener("click", () => {
  let location = document.querySelector("#userLocation").value;
  geocode(location, mapboxKey).then(function (result) {
    console.log(result);
    //6354 creekview lane, fishers, in 46038
    map.flyTo({ center: result, zoom: 16 });
    marker.setLngLat(result);
    locationCoord = result;
    setPage(locationCoord);
  });
});

function setWeatherTabs(data) {
  for (let i = 0; i < weatherTabsDiv.length; i++) {
    weatherTabsDiv[i].innerText = getDate(data.daily[i].dt);
  }
}

function setWeatherTabContent(data) {
  let html = "";
  for (let i = 0; i < weatherTabContentDiv.length; i++) {
    let weatherGif = getWeatherGif(data.daily[i].weather[0].id);
    let weatherChart = "";
    html += "<div class='col-4'>";
    html +=
      "<img src=" +
      weatherGif +
      ' alt="weather gif" class="img-fluid align-self-center">';
    html += '<div class="row">';
    html +=
      '<img src="/assets/weather-gifs/cold.png" alt="low temp" class="col-2 img-fluid w-25 mb-2">';
    html +=
      "<p class='col align-self-center'>" +
      Math.round(data.daily[i].temp.min) +
      "<span class='unit'>&#8457</span></p>";
    html += "</div>";
    html += '<div class="row">';
    html +=
      '<img src="/assets/weather-gifs/hot.png" alt="high temp" class="col-2 img-fluid w-25 mb-2">';
    html +=
      "<p class='col align-self-center'>" +
      Math.round(data.daily[i].temp.max) +
      "<span class='unit'>&#8457</span></p>";
    html += "</div>";
    html += '<div class="row">';
    html +=
      '<img src="/assets/weather-gifs/umbrella.png" alt="chance of rain" class="col-2 img-fluid w-25 mb-2">';
    html +=
      "<p class='col align-self-center'>" +
      Math.round(data.daily[i].pop * 100) +
      "<span class='unit'>%</span></p>";
    html += "</div>";
    html += "</div>";
    html += "</div>";

    weatherTabContentDiv[i].innerHTML = html;
    html = "";
  }
}

function setCurrentWeatherDiv(data, myLocation) {
  let weatherGif = getWeatherGif(data.current.weather[0].id);
  currentWeatherDiv.setHTML(
    `
      <div class ='card container'>
        <div class="card-header row border-1 colorMe text-light">
            <h3 class="col-6 text-start">${myLocation}</h3>
            <h3 class="col-6 text-end">Today</h3>
        </div>
        <div class="card-body row p-0">
            <div class="col-6 p-0 d-flex">
                <img src=${weatherGif} alt="weather gif" class="img-fluid align-self-center">
            </div>
            <div class="col-6">
                <div class="row mb-3 d-flex align-items-center">
                    <div class="col-4 py-2">
                        <img src="/assets/weather-gifs/temperature.png" alt="current temp" class="img-fluid">
                    </div>
                    <div class="col-8">
                    <span class="">${Math.round(data.current.temp)}&#8457</span>
                    </div>
                </div>
                <div class="row bg-light mb-3 d-flex align-items-center">
                    <div class="col-4 py-2">
                        <img src="/assets/weather-gifs/umbrella.png" alt="current temp" class="img-fluid">
                    </div>
                    <div class="col-8">
                    <span class="">${data.hourly[0].pop * 100}%</span>
                    </div>
                </div>
                <div class="row mb-3 d-flex align-items-center">
                    <div class="col-4 py-2">
                        <img src="/assets/weather-gifs/wind.png" alt="current temp" class="img-fluid">
                    </div>
                    <div class="col-8">
                    <span class="">${data.current.wind_speed} mph</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer row">
            <h3 class="text-center">${data.current.weather[0].description}</h3>
        </div>
      </div>
    `
  );
}

function getDate(date) {
  return new Date(date * 1000).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function setLocationName(data) {
  let locationName = "";
  $.get("http://api.openweathermap.org/geo/1.0/reverse", {
    APPID: weatherKey,
    lat: data.lat,
    lon: data.lon,
  }).done(function (locationData) {
    locationName = locationData[0].name;
    setCurrentWeatherDiv(data, locationName);
    setForecastedWeather(data);
  });
}

function setForecastedWeather(data) {
  forecastedWeatherTilesDiv.innerHTML = getForecastedWeatherTiles(data);
}

function getForecastedWeatherTiles(data) {
  let forecastedDayCount = 5;
  let html = "";
  for (let i = 1; i < forecastedDayCount; i++) {
    let weatherGif = getWeatherGif(data.daily[i].weather[0].id);
    html += '<div class="card col p-0 m-1 m-md-2 m-lg-3">';
    html += '<div class="card-header colorMe text-white p-2 pt-3">';
    html += "<h3 class='text-center'>" + getDate(data.daily[i].dt) + "</h3>";
    html += "</div>";
    html += '<div class="card-body">';
    html +=
      "<img src=" +
      weatherGif +
      ' alt="weather gif" class="img-fluid align-self-center">';
    html += "</div>";
    html +=
      '<div class="card-footer bg-light d-flex justify-content-between p-0 pt-3">';
    html += '<div class="col-4 p-0 text-center">';
    html +=
      '<img src="/assets/weather-gifs/cold.png" alt="low temp" class="img-fluid w-50 mb-2">';
    html +=
      "<p>" +
      Math.round(data.daily[i].temp.min) +
      "<span class='unit'>&#8457</span></p>";
    html += "</div>";
    html += '<div class="col-4 p-0 text-center">';
    html +=
      '<img src="/assets/weather-gifs/hot.png" alt="high temp" class="img-fluid w-50 mb-2">';
    html +=
      "<p>" +
      Math.round(data.daily[i].temp.max) +
      "<span class='unit'>&#8457</span></p>";
    html += "</div>";
    html += '<div class="col-4 p-0 text-center">';
    html +=
      '<img src="/assets/weather-gifs/umbrella.png" alt="chance of rain" class="img-fluid w-50 mb-2">';
    html +=
      "<p>" +
      Math.round(data.daily[i].pop * 100) +
      "<span class='unit'>%</span></p>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
  }
  return html;
}

function getWeatherGif(weatherState) {
  let weatherGifSource = "";
  if (weatherState < 200) {
    weatherGifSource = "/assets/weather-gifs/rainbow.gif";
  }
  if (weatherState < 300 && weatherState >= 200) {
    weatherGifSource = "/assets/weather-gifs/storm.gif";
  }
  if (weatherState < 400 && weatherState >= 300) {
    weatherGifSource = "/assets/weather-gifs/drizzle.gif";
  }
  if (weatherState < 500 && weatherState >= 400) {
    weatherGifSource = "/assets/weather-gifs/rainbow.gif";
  }
  if (weatherState < 600 && weatherState >= 500) {
    if (weatherState === 511) {
      weatherGifSource = "/assets/weather-gifs/icicles.gif";
    }
    weatherGifSource = "/assets/weather-gifs/rain.gif";
  }
  if (weatherState < 700 && weatherState >= 600) {
    weatherGifSource = "/assets/weather-gifs/snow-2.gif";
  }
  if (weatherState < 800 && weatherState >= 700) {
    if (weatherState === 781) {
      weatherGifSource = "/assets/weather-gifs/whirlwind.gif";
    }
    weatherGifSource = "/assets/weather-gifs/foggy.gif";
  }
  if (weatherState === 800) {
    weatherGifSource = "/assets/weather-gifs/sun.gif";
  }
  if (weatherState === 801) {
    weatherGifSource = "/assets/weather-gifs/cloudy.gif";
  }
  if (weatherState >= 802) {
    weatherGifSource = "/assets/weather-gifs/clouds.gif";
  }
  return weatherGifSource;
}
