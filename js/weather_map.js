(function() {
  "use strict"
  let locationCoord = [-98.48527, 29.423017];
  const zoomLevel = 10;
  const dayCount = 4;
  setPage(locationCoord);

  mapboxgl.accessToken = mapboxKey;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/gagejackson/clf2s2gln001601qik4wqike1", // style URL
    zoom: zoomLevel, // starting zoom
    center: locationCoord, // [lng, lat]
  });

  const currentWeatherDiv = document.querySelector("#currentWeather");
  const forecastedWeatherTilesDiv = document.querySelector("#forecastTiles");
  const newLocationButton = document.querySelector("#btn-submit-address");
  const weatherTabsDiv = document.getElementsByClassName("nav-link");
  const weatherTabContentDiv = document.getElementsByClassName("tab-pane");

  let marker = new mapboxgl.Marker({draggable: true, color: "#C3E6E7FF", className:"marker"})
      .setLngLat(locationCoord)
      .addTo(map);


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

  marker.on("dragend", () => {
    let dragCoords = marker.getLngLat();
    locationCoord = [dragCoords.lng, dragCoords.lat];
    setPage(locationCoord);
  });

  map.on("click", (e) => {
    let dragCoords = e.lngLat;
    locationCoord = [dragCoords.lng, dragCoords.lat];
    marker.setLngLat(locationCoord);
    setPage(locationCoord);
  });


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


  newLocationButton.addEventListener("click", () => {
    let location = document.querySelector("#userLocation").value;
    geocode(location, mapboxKey).then(function (result) {
      map.flyTo({center: result, zoom: zoomLevel});
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


  /*
  ///////////////////////////////////////////////////////////////////////
  Determines which gif to pull from assets from api
  ///////////////////////////////////////////////////////////////////////
   */
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


  /*
  ///////////////////////////////////////////////////////////////////////
  Create Current Weather HTML
  ///////////////////////////////////////////////////////////////////////
   */
  function setCurrentWeatherDiv(data, myLocation) {
    let weatherGif = getWeatherGif(data.current.weather[0].id);
    let html = "";
    html += `<div class ='card container'>`;

    html += `<div class="card-header row border-1 colorMe text-light">`;
    html += `<h3 class="text-start">${myLocation}</h3>`;
    html += `<h3 class="text-start">Today</h3>`;
    html += `</div>`;//end header

    html += `<div class="card-body row p-0">`;//start card body
    html += `<div class="col-6 p-0 d-flex">`;//start col 1 of 2
    html += `<img src=${weatherGif} alt="weather gif" class="img-fluid align-self-center">`;
    html += `</div>`;//end col 1 of 2 for image

    html += `<div class="col-6">`;//start col 2 of 2

    html += `<div class="row mb-3 d-flex align-items-center">`;
    html += `<div class="col-4 py-2">`;
    html += `<img src="/assets/weather-png/temperature.png" alt="current temp" class="img-fluid">`;
    html += `</div>`;
    html += `<div class="col-8">`;
    html += `<span class="">${Math.round(data.current.temp)}&deg</span>`;
    html += `</div>`;
    html += `</div>`;//end row 1 of 3

    html += `<div class="row bg-light mb-3 d-flex align-items-center">`;
    html += `<div class="col-4 py-2">`;
    html += `<img src="/assets/weather-png/umbrella.png" alt="current temp" class="img-fluid">`;
    html += `</div>`;
    html += `<div class="col-8">`;
    html += `<span class="">${data.hourly[0].pop * 100}%</span>`;
    html += `</div>`;
    html += `</div>`;//end row 2 of 3

    html += `<div class="row mb-3 d-flex align-items-center">`;
    html += `<div class="col-4 py-2">`;
    html += `<img src="/assets/weather-png/wind.png" alt="current temp" class="img-fluid">`;
    html += `</div>`;
    html += `<div class="col-8">`;
    html += `<span class="">${data.current.wind_speed} mph</span>`;
    html += `</div>`;
    html += `</div>`;//end row 3 of 3

    html += `</div>`;//end col 2 of 2
    html += `</div>`;//end card body

    html += `<div class="card-footer row">`;
    html += `<h3 class="text-center">${data.current.weather[0].description}</h3>`;
    html += `</div>`;//end Footer

    html += `</div>`;//end Card
    currentWeatherDiv.innerHTML = (html);
  }


  /*
  ///////////////////////////////////////////////////////////////////////
  Create Weather Tiles HTML
  ///////////////////////////////////////////////////////////////////////
   */
  function getForecastedWeatherTiles(data) {
    let forecastedDayCount = dayCount + 1;
    let html = "";
    for (let i = 1; i < forecastedDayCount; i++) {
      let weatherGif = getWeatherGif(data.daily[i].weather[0].id);

      html += '<div class="col">';
      html += '<div class="card">';

      html += '<div class="card-header colorMe text-white">';
      html += "<p class='text-center'>" + getDate(data.daily[i].dt) + "</p>";
      html += "</div>"; // end of card-header


      html += '<div class="card-body">';
      html += "<img src=" + weatherGif + ' alt="weather gif" class="img-fluid align-self-center">';
      html += "</div>"; //end of card-body


      html += '<div class="card-footer bg-light">';
      html += '<div class="row row-cols-3 g-3">';

      html += '<div class="col text-center">';
      html += '<img src="/assets/weather-png/cold.png" alt="low temp" class="img-fluid">';
      html += "<p>" + Math.round(data.daily[i].temp.min) + "<span class='unit'>&deg</span></p>";
      html += "</div>";//end of col

      html += '<div class="col text-center">';
      html += '<img src="/assets/weather-png/hot.png" alt="high temp" class="img-fluid">';
      html += "<p>" + Math.round(data.daily[i].temp.max) + "<span class='unit'>&deg</span></p>";
      html += "</div>";// end of col

      html += '<div class="col text-center">';
      html += '<img src="/assets/weather-png/umbrella.png" alt="chance of rain" class="img-fluid">';
      html += "<p>" + Math.round(data.daily[i].pop * 100) + "<span class='unit'>%</span></p>";
      html += "</div>";// end of col

      html += "</div>";//end of row
      html += "</div>";//end card-footer


      html += "</div>";//end of card
      html += "</div>";//end of big col
    }
    return html;
  }


  /*
  ///////////////////////////////////////////////////////////////////////
  Create Overview of weather tabs
  ///////////////////////////////////////////////////////////////////////
   */
  function setWeatherTabContent(data) {
    let html = "";
    for (let i = 0; i < weatherTabContentDiv.length; i++) {
      let weatherGif = getWeatherGif(data.daily[i].weather[0].id);
      let weatherChart = "";
      html += "<div class='row mt-3'>";
      html += "<div class='col-0 col-md-2'></div>";

      html += '<div class="card col-3 col-md p-0 mx-auto mx-md-2 my-2 border-0">';
      html += '<div class="card-body border-end p-0">';
      html += "<img src=" + weatherGif + ' alt="weather gif" class="img-fluid align-self-center pb-4">';
      html += "</div>";


      html += '<div class="card-footer d-flex justify-content-between p-0 border-end bg-white border-top-0">';
      html += '<div class="col-4 p-0 text-center">';
      html += '<img src="/assets/weather-png/cold.png" alt="low temp" class="img-fluid w-50 mb-2">';
      html += "<p>" + Math.round(data.daily[i].temp.min) + "<span class='unit'>&deg</span></p>";
      html += "</div>";


      html += '<div class="col-4 p-0 text-center">';
      html += '<img src="/assets/weather-png/hot.png" alt="high temp" class="img-fluid w-50 mb-2">';
      html += "<p>" + Math.round(data.daily[i].temp.max) + "<span class='unit'>&deg</span></p>";
      html += "</div>";


      html += '<div class="col-4 p-0 text-center">';
      html += '<img src="/assets/weather-png/umbrella.png" alt="chance of rain" class="img-fluid w-50 mb-2">';
      html += "<p>" + Math.round(data.daily[i].pop * 100) + "<span class='unit'>%</span></p>";
      html += "</div>";

      html += "</div>";
      html += "</div>";


      html += "<div class='col px-0'>";
      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/sunrise.png" alt="morning temp" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].temp.morn) + "<span class='unit'>&deg</span></p>";
      html += "</div>";

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly ">';
      html += '<img src="/assets/weather-png/sun.png" alt="day temp" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].temp.day) + "<span class='unit'>&deg</span></p>";
      html += "</div>"

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/night.png" alt="night temp" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].temp.night) + "<span class='unit'>&deg</span></p>";
      html += "</div>";
      html += "</div>";


      html += "<div class='col px-0 bg-light'>";
      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/clouds.png" alt="cloud coverage" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].clouds) + "<span class='unit'>%</span></p>";
      html += "</div>";

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/sun-icon.png" alt="uvi" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].uvi) + "<span class='unit'>uvi</span></p>";
      html += "</div>"

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/eco.png" alt="humidity" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].humidity) + "<span class='unit'>%</span></p>";
      html += "</div>";
      html += "</div>";


      html += "<div class='col px-0'>";
      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/weathercock.png" alt="wind direction" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].wind_deg) + "<span class='unit'>deg</span></p>";
      html += "</div>";

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/wind.png" alt="wind speed" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].wind_speed) + "<span class='unit'>mph</span></p>";
      html += "</div>"

      html += '<div class="row px-0 py-2 m-0 mb-2 justify-content-evenly">';
      html += '<img src="/assets/weather-png/gust.png" alt="gust speed" class="col-5 w-50 h-50 ratio ratio-1x1">';
      html += "<p class='col-5 p-0 text-nowrap my-auto'>" + Math.round(data.daily[i].wind_gust) + "<span class='unit'>mph</span></p>";
      html += "</div>";
      html += "</div>";


      html += "<div class='col-0 col-md-2'></div>";
      html += "</div>";

      weatherTabContentDiv[i].innerHTML = html;
      html = "";
    }
  }
})();
