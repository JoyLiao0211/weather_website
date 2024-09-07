const mapZoom = 12;
var marker;

// Initialize the map
var map = L.map('map').setView([25.1, 121.6], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Variables to hold map elements
var rectangles = [];
var overlay = null;

// Color and grid settings for rainfall
var colorlevel = [0, 1, 2, 6, 10, 15, 20, 30, 40, 50, 70, 90, 110, 130, 150, 200, 300, 400];
var cwb_data = ['None', '#9BFFFF', '#00CFFF', '#0198FF', '#0165FF', '#309901', '#32FF00', '#F8FF00', '#FFCB00', '#FF9A00', '#FA0300', '#CC0003', '#A00000', '#98009A', '#C304CC', '#F805F3', '#FECBFF'];

var earthRadiusKm = 6371; // Earth's radius in kilometers

// Radar data for different locations
const radarData = {
  shulin: {
    imageUrl: "https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-001.png",
    stationLat: 24.993,
    stationLon: 121.40070,
    radiusKm: 150,
    imageBounds: calculateBounds(24.993, 121.40070, 150)
  },
  nantun: {
    imageUrl: "https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0084-002.png",
    stationLat: 24.135,
    stationLon: 120.585,
    radiusKm: 150,
    imageBounds: calculateBounds(24.135, 120.585, 150)
  },
  combined: {
    imageUrl: "https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0058-003.png",
    imageBounds: [[20.5, 118.0], [26.5, 124.0]] // Static bounds for the combined radar
  }
};

// Function to calculate image bounds based on radius
function calculateBounds(lat, lon, radiusKm) {
  const latDiff = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lonDiff = (radiusKm / (earthRadiusKm * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI);

  return [
    [lat - latDiff, lon - lonDiff], // Southwest corner
    [lat + latDiff, lon + lonDiff]  // Northeast corner
  ];
}

// Function to get color based on rainfall value
function getColorForRainfall(value) {
  for (var i = 0; i < colorlevel.length; i++) {
    if (value < colorlevel[i]) {
      return cwb_data[i];
    }
  }
  return cwb_data[cwb_data.length - 1];  // Use the last color if it exceeds the max value
}

// Clear existing rainfall grid
function clearGrid() {
  rectangles.forEach(function(rect) {
    map.removeLayer(rect);
  });
  rectangles = [];
}

// Draw the rainfall grid
function drawGrid(data) {
  var gridSizeLat = (data.Y[1][0] - data.Y[0][0]);  // Latitude grid size
  var gridSizeLng = (data.X[0][1] - data.X[0][0]);  // Longitude grid size
  //console.log("test")
  for (var i = 0; i < 441; i++) {
    //console.log(i)
    for (var j = 0; j < 561; j++) {
      var bounds = [
        [data.Y[j][i], data.X[j][i]],  // Top-left coordinate
        [data.Y[j][i] + gridSizeLat, data.X[j][i] + gridSizeLng]  // Bottom-right coordinate
      ];
      var color = getColorForRainfall(data.Z[j][i]);

      if (color !== 'None') {
        var rect = L.rectangle(bounds, { 
          color: color, 
          weight: 0,         
          fillOpacity: 0.5
        }).addTo(map);

        rectangles.push(rect);
      }
    }
  }
}

// Fetch rainfall data from the backend and update the grid
function updateGrid() {
  //console.log("start")
  fetch('/rainfall_data')
    .then(response => response.json())
    .then(data => {
      clearGrid();  // Clear current grid
      drawGrid(data);  // Draw new grid

      //var timestampDiv = document.getElementById('timestamp');
      //timestampDiv.innerText = 'Data Time: ' + data.Datetime;
    });
}

// Function to display radar overlay
function displayWeatherOverlay() {
  const selectedRadar = document.getElementById('radarSelector').value;
  const radarInfo = radarData[selectedRadar];

  if (overlay) {
    overlay.setUrl(radarInfo.imageUrl);  // Update the radar image URL
    overlay.setBounds(radarInfo.imageBounds);  // Update the radar bounds
  } else {
    overlay = L.imageOverlay(radarInfo.imageUrl, radarInfo.imageBounds, { opacity: 0.8 }).addTo(map);
  }
}

// Clear radar overlay
function clearOverlay() {
  if (overlay) {
    map.removeLayer(overlay);
    overlay = null;
  }
}

window.onload = function() {
  getLocation(); // Call your function to get the user's location

  // Trigger the 'change' event on the radarSelector element to initialize the default state
  var radarSelector = document.getElementById('radarSelector');
  var changeEvent = new Event('change');
  radarSelector.dispatchEvent(changeEvent);

  // Optionally, trigger other events if needed, e.g., checkbox toggle or location selection
  var toggleOverlayCheckbox = document.getElementById('toggleOverlay');
  var checkboxEvent = new Event('change');
  toggleOverlayCheckbox.dispatchEvent(checkboxEvent);
};

// 監聽選項變化，根據選擇來調用不同的功能
document.getElementById('currentLocation').addEventListener('change', function() {
  document.getElementById('customAddressSection').style.display = 'none'; // 隱藏地址輸入欄
  getLocation(); // 選擇「所在地」時自動調用getLocation()
});

document.getElementById('customLocation').addEventListener('change', function() {
  document.getElementById('customAddressSection').style.display = 'flex'; // joy: flex才能在同一排
});


// Handle grid and radar toggle
document.getElementById('radarSelector').addEventListener('change', function() {
  const selectedOption = document.getElementById('radarSelector').value;

  if (selectedOption === "historical") {
    clearOverlay();  // Clear radar if it's active
    updateGrid();  // Display the historical rainfall grid
  } else {
    clearGrid();  // Clear rainfall grid
    displayWeatherOverlay();  // Add radar overlay
  }
});

// Handle checkbox to toggle radar or grid visibility
document.getElementById('toggleOverlay').addEventListener('change', function (event) {
  if (event.target.checked) {
    const selectedOption = document.getElementById('radarSelector').value;
    if (selectedOption === "historical") {
      updateGrid();  // Show historical grid
    } else {
      displayWeatherOverlay();  // Show radar
    }
  } else {
    clearOverlay();  // Hide radar
    clearGrid();  // Hide rainfall grid
  }
});

// Handle slider for opacity control
document.getElementById('overlayOpacity').addEventListener('input', function(event) {
  const opacityValue = event.target.value / 100;
  if (overlay) {
    overlay.setOpacity(opacityValue);  // Adjust opacity of the radar overlay
  }
});

// Function to handle address search
function searchAddress() {
  const address = document.getElementById('addressInput').value;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        clearOverlay();  // Clear radar
        displayMap(lat, lon, mapZoom);
        displayWeatherOverlay();  // Add radar overlay
      } else {
        alert('無法找到地址');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('搜尋地址時出錯: ' + error.message);
    });
}

// Function to show current location
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
  displayMap(latitude, longitude, mapZoom);
  displayWeatherOverlay();
}

function displayMap(lat, lon, zoomLevel) {
  if (!map) {
    map = L.map('map').setView([lat, lon], zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 添加或更新標記
    marker = L.marker([lat, lon]).addTo(map).bindPopup("你在這裡").openPopup();
  } else {
    map.setView([lat, lon], zoomLevel);

    // 如果地圖已經存在，更新標記
    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon]).addTo(map).bindPopup("你在這裡").openPopup();
    }
  }
}
