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
  fetchOverlayData(); // Fetch overlay data from the JSON
}

function displayMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 13); // Set the map view to user's location

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
}

// Function to fetch the overlay data from the JSON
function fetchOverlayData() {
  fetch("https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/O-A0084-001?Authorization=CWA-EAC5F54B-AD17-4E60-8715-38C2490AED66&downloadType=WEB&format=JSON") // Replace with the actual path to your JSON file
    .then(response => response.json())
    .then(data => {
      const overlayData = data.cwaopendata.dataset;
      const imageUrl = overlayData.resource.ProductURL;
      const lat = parseFloat(overlayData.datasetInfo.parameterSet.StationLatitude);
      const lon = parseFloat(overlayData.datasetInfo.parameterSet.StationLongitude);
      
      // Use the fetched data to display the overlay
      displayWeatherOverlay(lat, lon, imageUrl);
    })
    .catch(error => console.error('Error fetching the overlay data:', error));
}

// Function to overlay the weather image based on the fetched data
function displayWeatherOverlay(lat, lon, imageUrl) {
  const imageBounds = [[lat - 0.75, lon - 0.75], [lat + 0.75, lon + 0.75]]; // Adjust bounds based on the image size

  // Overlay the weather image on top of the map
  L.imageOverlay(imageUrl, imageBounds, { opacity: 0.5 }).addTo(map); // Set opacity to 0.5 (50% transparency)
}
