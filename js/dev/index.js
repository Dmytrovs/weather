import "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const apiKey = "bcc87287dcc2facd330fcba08ed41a8f";
const form = document.querySelector(".weather__block-search");
const input = document.querySelector(".weather__input");
document.querySelector(".weather__btn");
const condition = document.querySelector(".weather-details__condition");
const logo = document.querySelector(".weather__logo");
logo.addEventListener("click", () => {
  location.reload();
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cityName = input.value.trim();
  if (cityName) {
    console.log("Користувач написав:", cityName);
    const coords = await getCoordinatesByCityName(cityName);
    await getWeatherMain(coords.lat, coords.lon);
  } else {
    console.log("Пусте поле");
  }
});
async function getCoordinatesByCityName(cityName) {
  const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
  const data = await response.json();
  console.log(data);
  console.log(data[0].lat);
  const lat = data[0].lat;
  console.log(data[0].lon);
  const lon = data[0].lon;
  return { lat, lon };
}
let snowEffect;
async function getWeatherMain(lat, lon) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en
`);
  const data = await response.json();
  console.log(data);
  if (data.list[0].weather[0].main === "Snow") {
    if (!snowEffect) {
      snowEffect = new Snow({
        showSnowflakes: true,
        showSnowBalls: true
      });
    }
  } else {
    if (snowEffect) {
      document.querySelectorAll(".snowflakes, .snowballs, .snowflake").forEach((el) => el.remove());
      snowEffect = null;
    }
  }
  const iconCode = data.list[0].weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const iconUrl2 = `https://openweathermap.org/img/wn/${iconCode}.png`;
  const date = new Date(data.list[0].dt_txt);
  console.log(date);
  const options = { weekday: "long" };
  console.log(options);
  const dayName = date.toLocaleDateString("en-US", options);
  console.log(dayName);
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
  const time = date.toLocaleTimeString("uk-UA", timeOptions);
  console.log(time);
  const optionDayMonthYear = { day: "2-digit", month: "long", year: "numeric" };
  const fullDay = date.toLocaleDateString("en-GB", optionDayMonthYear);
  console.log(fullDay);
  document.querySelector(".weather-widget__location").textContent = data.city.name;
  document.querySelector(".weather-widget__temperature").textContent = Math.round(data.list[0].main.temp) + "°C ";
  document.querySelector(".weather-widget__datetime").textContent = `${time} - ${dayName}
${fullDay}`;
  document.querySelector(".weather-details__value--max").textContent = Math.round(data.list[0].main.temp_max) + "°C ";
  document.querySelector(".weather-details__value--min").textContent = Math.floor(data.list[0].main.temp_min) + "°C ";
  document.querySelector(".weather-details__value--feels").textContent = Math.round(data.list[0].main.feels_like) + "°C ";
  document.querySelector(".weather-details__value-humadity").textContent = Math.round(data.list[0].main.humidity) + "%";
  document.querySelector(".weather-details__value-wind").textContent = Math.round(data.list[0].wind.speed) + " m/s";
  document.querySelector(".weather-details__value-cloudy").textContent = data.list[0].clouds.all + "%";
  document.querySelector(".weather-details__condition").textContent = data.list[0].weather[0].description;
  document.querySelector(".weather-widget__icon").src = iconUrl;
  const img = document.createElement("img");
  img.src = iconUrl2;
  condition.append(img);
}
getWeatherMain();
document.querySelector(".weather__geoBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherMain(lat, lon);
      },
      (error) => {
        document.querySelector(".weather__output").textContent = "Failed to get geolocation:" + error.message;
      }
    );
  } else {
    document.querySelector(".weather__output").textContent = "Your browser does not support geolocation";
  }
});
