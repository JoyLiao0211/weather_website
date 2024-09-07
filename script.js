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
  console.log
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

const earthRadiusKm = 6371; // Earth's radius in kilometers

// Function to overlay the weather image based on the user's location
function displayWeatherOverlay() {
    const imageUrl = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png'; // The radar image URL
                    //https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png
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
    L.imageOverlay(imageUrl, imageBounds, { opacity: 0.8 }).addTo(map);
  }
  
