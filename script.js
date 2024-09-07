let map;
let overlay; // To keep track of the radar overlay layer
const earthRadiusKm = 6371; // Earth's radius in kilometers

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("此瀏覽器不支持地理位置服務。");
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  displayMap(latitude, longitude);
  displayWeatherOverlay(latitude, longitude); // Add the weather overlay after displaying the map
}

function displayMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 11); // Set the map view to user's location

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
}

// Function to overlay the weather image based on the user's location
function displayWeatherOverlay() {
  const imageUrl = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png'; // The radar image URL
  const stationLat = 24.993; // Station latitude
  const stationLon = 121.40070; // Station longitude
  const radiusKm = 150; // 150 kilometers as the range of the radar

  // Convert the radius to degrees (approximation)
  const latDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDiff = (radiusKm / (earthRadiusKm * Math.cos(stationLat * Math.PI / 180))) * (180 / Math.PI);

  // Define the bounds of the image overlay (Southwest and Northeast corners)
  const imageBounds = [
    [stationLat - latDiff, stationLon - lonDiff], // Southwest corner
    [stationLat + latDiff, stationLon + lonDiff]  // Northeast corner
  ];

  // Overlay the radar image on the map with opacity
  overlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 0.8 }).addTo(map);
}

// Function to toggle overlay visibility based on checkbox
document.getElementById('toggleOverlay').addEventListener('change', function (event) {
  if (event.target.checked) {
    // If the checkbox is checked, add the overlay back to the map
    displayWeatherOverlay();
  } else {
    // If unchecked, remove the overlay from the map
    if (overlay) {
      map.removeLayer(overlay);
    }
  }
});

// Function to adjust overlay opacity based on slider value
document.getElementById('overlayOpacity').addEventListener('input', function (event) {
  const opacityValue = event.target.value / 100; // Get value from slider and convert to 0-1 range
  if (overlay) {
    overlay.setOpacity(opacityValue); // Adjust the opacity of the overlay
  }
});

function searchAddress() {
  const address = document.getElementById('addressInput').value;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        displayMap(lat, lon);
        displayWeatherOverlay(lat, lon);
      } else {
        alert('無法找到地址');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('搜尋地址時出錯');
    });
}
