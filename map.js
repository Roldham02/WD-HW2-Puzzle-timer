let map;
let routingControl;
let timerInterval;
let remainingTime = 0;
const API_KEY = 'd30672bb-2ee0-41b1-9beb-5f22fc0ba2e6';

function initMap() {
    try {
        map = L.map('map').setView([31.8086111, -85.97], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } catch (error) {
        console.error("Error initializing map:", error);
        alert("Failed to initialize map. Please check your internet connection and try again.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    const showRouteButton = document.getElementById('show-route');

    if (showRouteButton) {
        showRouteButton.addEventListener('click', async function() {
            const startAddress = document.getElementById('start-address').value;
            const endAddress = document.getElementById('end-address').value;

            if (startAddress && endAddress) {
                try {
                    const startCoords = await geocode(startAddress);
                    const endCoords = await geocode(endAddress);
                    calculateAndDisplayRoute(startCoords, endCoords);
                } catch (error) {
                    console.error("Error calculating route:", error);
                    alert("Error: " + error.message);
                }
            } else {
                alert("Please enter both start and end locations.");
            }
        });
    } else {
        console.error("The 'show-route' button was not found in the DOM.");
    }
});

async function geocode(address) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
            return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
            throw new Error(`Could not geocode address: ${address}`);
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
}

function calculateAndDisplayRoute(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    const graphHopperRouter = new L.Routing.GraphHopper(API_KEY, {
        profile: "car",
        language: 'en-us',
        units: 'mi'
    });

    routingControl = L.Routing.control({
        waypoints: [start, end],
        router: graphHopperRouter,
        routeWhileDragging: true,
        showAlternatives: true,
        lineOptions: {
            styles: [{color: '#4a90e2', opacity: 0.7, weight: 6}]
        }
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
            saveTimerState();
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
    saveTimerState();
});

function updateTimerDisplay() {
    const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = (remainingTime % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${hours}:${minutes}:${seconds}`;
}

function saveTimerState() {
    localStorage.setItem('timerState', JSON.stringify({
        remainingTime,
        lastUpdated: Date.now()
    }));
}

document.addEventListener('mousemove', function(e) {
    document.getElementById('mouse-tracker').textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
});

document.addEventListener('DOMContentLoaded', function() {
    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
        const elapsedTime = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
        remainingTime = Math.max(0, savedState.remainingTime - elapsedTime);
        updateTimerDisplay();
    }
});
