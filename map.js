let map;
let routingControl;
let timerInterval;
let remainingTime = 0;

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

document.getElementById('show-route').addEventListener('click', function() {
    const startAddress = document.getElementById('start-address').value.split(',');
    const endAddress = document.getElementById('end-address').value.split(',');

    if (startAddress.length === 2 && endAddress.length === 2) {
        calculateAndDisplayRoute(
            L.latLng(parseFloat(startAddress[0]), parseFloat(startAddress[1])),
            L.latLng(parseFloat(endAddress[0]), parseFloat(endAddress[1]))
        );
    } else {
        alert("Please enter valid coordinates for both start and end locations.");
    }
});

function calculateAndDisplayRoute(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [start, end],
        router: new L.Routing.OpenRouteService('5b3ce3597851110001cf6248f4c1898499f24dd7915143628c3967b5'),
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
