// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyC1VlG4lXsJ7x0k6t_UdfEXULlIf1QaT3Q",
    authDomain: "civicissuereportingplatform.firebaseapp.com",
    projectId: "civicissuereportingplatform",
    storageBucket: "civicissuereportingplatform.firebasestorage.app",
    messagingSenderId: "764704688619",
    appId: "1:764704688619:web:fe44c0180535d9eb3f31ae"
};


// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Store current user location globally
let currentUserLat = null;
let currentUserLng = null;


// Create map
const map = L.map("map", {
    zoomControl: false
}).setView([30.7046, 76.7179], 13);


// Zoom control
L.control.zoom({ position: "topright" }).addTo(map);


// Dark theme tiles
L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    {
        maxZoom: 20,
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// Detect current location automatically
map.locate({
    setView: true,
    maxZoom: 17,
    enableHighAccuracy: true,
    timeout: 10000
});


// When location found
map.on("locationfound", function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const accuracy = e.accuracy;

    currentUserLat = lat;
    currentUserLng = lng;

    console.log("Current location:", lat, lng);

    // ✅ dispatch custom event
    window.dispatchEvent(
        new CustomEvent("locationReady", {
            detail: { lat, lng }
        })
    );

    // marker
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
            `📍 Your Current Location<br>Accuracy: ${Math.round(accuracy)} meters`
        )
        .openPopup();

    // circle
    L.circle([lat, lng], {
        radius: accuracy,
        color: "#007bff",
        fillOpacity: 0.15
    }).addTo(map);
});

// If location fails
map.on("locationerror", function () {
    alert("⚠️ Could not fetch current location. Please enable location access.");
});


// Load reported issues from Firebase
async function loadIssues() {
    try {
        const querySnapshot = await getDocs(collection(db, "issues"));

        console.log("Total issues:", querySnapshot.size);

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.lat === undefined || data.lng === undefined) {
                console.log("Skipping issue:", data.title);
                return;
            }

            const lat = Number(data.lat);
            const lng = Number(data.lng);

            if (isNaN(lat) || isNaN(lng)) {
                console.log("Invalid coordinates:", data);
                return;
            }

            let color = "red";

            if (data.status === "Resolved") color = "green";
            else if (data.status === "In Progress") color = "orange";

            L.circleMarker([lat, lng], {
                radius: 9,
                color: color,
                fillOpacity: 0.9
            })
                .addTo(map)
                .bindPopup(`
                    <b>${data.title}</b><br>
                    📌 ${data.category}<br>
                    📍 ${data.location}<br>
                    🚦 ${data.status}
                `);
        });
    } catch (error) {
        console.error("Error loading issues:", error);
    }
}


// Load all issue markers
loadIssues();


// Optional click debug
map.on("click", function (e) {
    console.log("Clicked at:", e.latlng);
});


// Export current location for other files
window.getCurrentCoordinates = function () {
    return {
        lat: currentUserLat,
        lng: currentUserLng
    };
};