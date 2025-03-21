let map;
let routingControl;
let timerInterval;
let remainingTime = 0;
const API_KEY = '5b3ce3597851110001cf6248f4c1898499f24dd7915143628c3967b5';

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

document.getElementById('show-route').addEventListener('click', async function() {
    const startAddress = document.getElementById('start-address').value;
    const endAddress = document.getElementById('end-address').value;

    if (startAddress && endAddress) {
        try {
            const startCoords = await geocode(startAddress);
            const endCoords = await geocode(endAddress);
            calculateAndDisplayRoute(startCoords, endCoords);
        } catch (error) {
            alert("Error: " + error.message);
        }
    } else {
        alert("Please enter both start and end locations.");
    }
});

async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
        return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    } else {
        throw new Error(`Could not geocode address: ${address}`);
    }
}

function calculateAndDisplayRoute(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    const osrRouter = L.Routing.openrouteservice(API_KEY, {
        "timeout": 30 * 1000,
        "format": "json",
        "host": "https://api.openrouteservice.org",
        "service": "directions",
        "api_version": "v2",
        "profile": "driving-car",
        "routingQueryParams": {
            "attributes": ["avgspeed", "percentage"],
            "language": "en",
            "maneuvers": "true",
            "preference": "recommended"
        }
    });

    routingControl = L.Routing.control({
        waypoints: [start, end],
        router: osrRouter,
        routeWhileDragging: true,
        showAlternatives: false
    }).addTo(map);
}

document.getElementById('start-timer').addEventListener('click', function() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    remainingTime = hours * 3600 + minutes * 60 + seconds;
    updateTimerDisplay();
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
        } else {
            remainingTime--;
            updateTimerDisplay();
        }
    }, 1000);
});

document.getElementById('pause-timer').addEventListener('click', function() {
    clearInterval(timerInterval);
});

document.getElementById('reset-timer').addEventListener('click', function() {
    clearInterval(timerInterval);
    remainingTime = 0;
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    updateTimerDisplay();
});

function updateTimerDisplay() {
    const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (remainingTime % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${hours}:${minutes}:${seconds}`;
}

document.addEventListener('mousemove', function(e) {
    document.getElementById('mouse-tracker').textContent = 
        `X: ${e.clientX}, Y: ${e.clientY}`;
});

window.onload = initMap;
