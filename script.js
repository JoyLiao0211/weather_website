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
  map = L.map('map').setView([lat, lon], 13); // Set the map view to user's location

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("You are here").openPopup();
}

// Function to overlay the weather image based on the user's location
function displayWeatherOverlay() {
    const imageUrl = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png'; // The radar image URL
  
    const stationLat = 25.00; // Station latitude
    const stationLon = 121.40; // Station longitude
  
    const radiusKm = 150; // 150 kilometers as the range of the radar
    
    // Convert the radius to degrees (approximation)
    const latDiff = radiusKm / 111; // Approximate conversion from km to degrees latitude (1 degree ≈ 111 km)
    const lonDiff = radiusKm / (111 * Math.cos(stationLat * Math.PI / 180)); // Adjust for longitude using latitude
  
    // Define the bounds of the image overlay (Southwest and Northeast corners)
    const imageBounds = [
      [stationLat - latDiff, stationLon - lonDiff], // Southwest corner
      [stationLat + latDiff, stationLon + lonDiff]  // Northeast corner
    ];
  
    // Overlay the radar image on the map with opacity
    L.imageOverlay(imageUrl, imageBounds, { opacity: 1 }).addTo(map);
  }
  
