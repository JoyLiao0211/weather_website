let map;
let marker; // 定義 marker 變數
let overlay;
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
  displayWeatherOverlay(latitude, longitude);
}

function displayMap(lat, lon) {
  if (!map) {
    // If map does not exist, create it
    map = L.map('map').setView([lat, lon], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    // If map exists, just update the view
    map.setView([lat, lon], 11);
  }

  // Add or update the marker
  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
  }
}

function displayWeatherOverlay(lat, lon) {
  const imageUrl = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png';
  const stationLat = 24.993;
  const stationLon = 121.40070;
  const radiusKm = 150;

  const latDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDiff = (radiusKm / (earthRadiusKm * Math.cos(stationLat * Math.PI / 180))) * (180 / Math.PI);

  const imageBounds = [
    [stationLat - latDiff, stationLon - lonDiff],
    [stationLat + latDiff, stationLon + lonDiff]
  ];

  if (overlay) {
    overlay.setBounds(imageBounds);
  } else {
    overlay = L.imageOverlay(imageUrl, imageBounds, { opacity: 0.8 }).addTo(map);
  }
}

function clearOverlay() {
  if (overlay) {
    map.removeLayer(overlay);
    overlay = null;
  }
}

function searchAddress() {
  const address = document.getElementById('addressInput').value;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        clearOverlay(); // Remove old overlay
        displayMap(lat, lon);
        displayWeatherOverlay(lat, lon);
      } else {
        alert('無法找到地址');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('搜尋地址時出錯: ' + error.message);
    });
}

document.getElementById('toggleOverlay').addEventListener('change', function (event) {
  if (event.target.checked) {
    displayWeatherOverlay();
  } else {
    clearOverlay();
  }
});

document.getElementById('overlayOpacity').addEventListener('input', function (event) {
  const opacityValue = event.target.value / 100; // Get value from slider and convert to 0-1 range
  if (overlay) {
    overlay.setOpacity(opacityValue); // Adjust the opacity of the overlay
  }
});
