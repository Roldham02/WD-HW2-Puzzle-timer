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
    restoreTimerState();
});

document.getElementById('show-route').addEventListener('click', async function() {
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

    const orsRouter = L.Routing.openrouteservice(API_KEY, {
        timeout: 30 * 1000,
        format: 'json',
        host: 'https://api.openrouteservice.org',
        service: 'directions',
        api_version: 'v2',
        profile: 'driving-car',
        routingQueryParams: {
            options: {
                avoid_features: ['ferries', 'tunnels'],
                round_trip: {
                    length: 10000,  // 10km round trip
                    points: 4,
                    seed: 42
                }
            }
        }
    });

    routingControl = L.Routing.control({
        waypoints: start === end ? [start] : [start, end],
        router: orsRouter,
        routeWhileDragging: true,
        lineOptions: {
            styles: [{color: '#4a90e2', opacity: 0.7, weight: 6}]
        }
    }).addTo(map);

    routingControl.on('routeselected', (e) => {
        const route = e.route;
        const duration = Math.round(route.summary.totalTime / 60);
        const distance = (route.summary.totalDistance / 1000).toFixed(2);
        document.getElementById('route-info').innerHTML = `
            <p>Route duration: ${duration} minutes</p>
            <p>Route distance: ${distance} km</p>
        `;
    });

    routingControl.on('routingerror', (e) => {
        console.error('Routing error:', e.error);
        alert(`Routing failed: ${e.error.message}`);
    });
}

function startTimer(initialTime) {
    remainingTime = initialTime;
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
}

document.getElementById('start-timer').addEventListener('click', function() {
    if (!validateTimeInputs()) return;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    startTimer(hours * 3600 + minutes * 60 + seconds);
});

document.getElementById('pause-timer').addEventListener('click', function() {
    clearInterval(timerInterval);
    timerInterval = null;
    saveTimerState();
});

document.getElementById('reset-timer').addEventListener('click', function() {
    clearInterval(timerInterval);
    timerInterval = null;
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
        lastUpdated: Date.now(),
        isRunning: !!timerInterval
    }));
}

function restoreTimerState() {
    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
        const elapsedTime = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
        remainingTime = Math.max(0, savedState.remainingTime - elapsedTime);
        updateTimerDisplay();
        if (savedState.isRunning) {
            startTimer(remainingTime);
        }
    }
}

function validateTimeInputs() {
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');
    
    if (parseInt(minutes.value) > 59) {
        alert('Minutes must be between 0 and 59');
        return false;
    }
    if (parseInt(seconds.value) > 59) {
        alert('Seconds must be between 0 and 59');
        return false;
    }
    return true;
}


let lastUpdate = 0;
document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastUpdate >= 100) { // Update every 100ms
        document.getElementById('mouse-tracker').textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
        lastUpdate = now;
    }
});

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (timerInterval) {
            document.getElementById('pause-timer').click();
        } else {
            document.getElementById('start-timer').click();
        }
    } else if (e.code === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('show-route').click();
    }
});
