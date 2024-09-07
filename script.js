let map;

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  displayMap(latitude, longitude);
  displayWeatherImage(latitude, longitude);
}

function displayMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 13); // Set the map view to user's location

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
}

function displayWeatherImage(lat, lon) {
  let imageUrl;

  // Simple logic to determine weather image based on lat/lon
  if (lat >= 25 && lat <= 26 && lon >= 121 && lon <= 122) {
    imageUrl = 'path/to/taipei-weather.jpg'; // Example region: Taipei
  } else if (lat >= 24 && lat <= 25 && lon >= 120 && lon <= 121) {
    imageUrl = 'path/to/taichung-weather.jpg'; // Example region: Taichung
  } else {
    imageUrl = 'path/to/default-weather.jpg'; // Default image for other locations
  }

  // Display weather image on the map as an overlay
  L.imageOverlay(imageUrl, [[lat - 0.1, lon - 0.1], [lat + 0.1, lon + 0.1]]).addTo(map);
}
