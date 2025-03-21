let map;
let routingControl;
let timerInterval;
let remainingTime = 0;
const API_KEY = '5b3ce3597851110001cf6248f4c1898499f24dd7915143628c3967b5';

function initMap() {
    map = L.map('map').setView([31.8086111, -85.97], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap contributors'
    }).addTo(map);
    
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
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

    const osrRouter = new L.Routing.OpenRouteService(API_KEY, {
        profile: "driving-car",
        timeout: 30000,
        language: 'en',
        units: 'mi'
    });

    routingControl = L.Routing.control({
        waypoints: [start, end],
        router: osrRouter,
        routeWhileDragging: true,
        showAlternatives: false,
        language: 'en',
        units: 'imperial'
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        var routes = e.routes;
        var summary = routes[0].summary;
        summary.totalDistance = summary.totalDistance / 1609.34;
        summary.totalTime = summary.totalTime / 3600;
        var avgSpeedMph = summary.totalDistance / summary.totalTime;

        var instructions = routes[0].instructions;
        instructions.forEach(function(instruction) {
            instruction.text = translateToEnglish(instruction.text);
            if (instruction.distance) {
                instruction.distance = instruction.distance / 1609.34;
            }
        });

        routingControl._router.options.language = 'en';
        routingControl._formatter.options.units = 'imperial';
        routingControl._formatter.options.language = 'en';
        routingControl._container.innerHTML = '';
        routingControl._updateLineOptions({styles: [{color: '#4a90e2', opacity: 0.7, weight: 6}]});
        routingControl._updateRouteSelection({route: routes[0]});
    });
}

function translateToEnglish(text) {
    return text;
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
    document.getElementById('mouse-tracker').textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
});
