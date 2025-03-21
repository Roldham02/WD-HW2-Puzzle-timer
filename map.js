const map = L.map('map').setView([52.5, 13.4], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const apiKey = '5b3ce3597851110001cf6248f4c1898499f24dd7915143628c3967b5';

const control = L.Routing.control({
    waypoints: [
        L.latLng(52.5, 13.4),
        L.latLng(52.6, 13.5)
    ],
    router: L.Routing.openrouteservice(apiKey),
    routeWhileDragging: true
}).addTo(map);

document.getElementById('show-route').addEventListener('click', function () {
    const startAddress = document.getElementById('start-address').value;
    const endAddress = document.getElementById('end-address').value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${startAddress}`)
        .then(response => response.json())
        .then(data => {
            const startCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${endAddress}`)
                .then(response => response.json())
                .then(data => {
                    const endCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    control.setWaypoints([L.latLng(startCoords), L.latLng(endCoords)]);
                });
        });
});

let timerInterval;
let remainingTime;

document.getElementById('start-timer').addEventListener('click', function () {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    remainingTime = (hours * 3600) + (minutes * 60) + seconds;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(function () {
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            return;
        }

        remainingTime--;
        const hoursLeft = Math.floor(remainingTime / 3600);
        const minutesLeft = Math.floor((remainingTime % 3600) / 60);
        const secondsLeft = remainingTime % 60;

        document.getElementById('timer-display').textContent = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
    }, 1000);
});

document.getElementById('pause-timer').addEventListener('click', function () {
    clearInterval(timerInterval);
});

document.getElementById('reset-timer').addEventListener('click', function () {
    clearInterval(timerInterval);
    document.getElementById('timer-display').textContent = '00:00:00';
    remainingTime = 0;
});

function pad(number) {
    return number < 10 ? '0' + number : number;
}

document.addEventListener('mousemove', function (event) {
    document.getElementById('mouse-tracker').textContent = `X: ${event.clientX}, Y: ${event.clientY}`;
});
