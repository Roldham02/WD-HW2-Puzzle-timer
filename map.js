let map;
let routingControl;
const API_KEY = 'your_openrouteservice_api_key_here';

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', function () {
    initMap();
});

document.getElementById('show-route').addEventListener('click', async function () {
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
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.length > 0) return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    else throw new Error(`Could not geocode address: ${address}`);
}

function calculateAndDisplayRoute(start, end) {
    if (routingControl) map.removeControl(routingControl);

    const osrRouter = L.Routing.openrouteservice(API_KEY, {
        profile: "driving-car",
        timeout: 30 * 1000,
        language: "en",
        units: "mi",
        service: "directions",
        api_version: "v2",
        routingQueryParams: {
            attributes: ["avgspeed", "percentage"],
            maneuvers: "true",
            preference: "recommended"
        }
    });

    routingControl = L.Routing.control({
        waypoints: [start, end],
        router: osrRouter,
        routeWhileDragging: true,
        showAlternatives: false,
        lineOptions: {
            styles: [{ color: '#4a90e2', opacity: 0.7, weight: 6 }]
        },
        createMarker: function () { return null; }
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        console.log(`Distance: ${(summary.totalDistance / 1609.34).toFixed(2)} miles`);
        console.log(`Time: ${(summary.totalTime / 3600).toFixed(2)} hours`);
    });

    routingControl.on('routingerror', function (e) {
        console.error("Routing error:", e);
        alert("Error calculating route. Please try again.");
    });
}
