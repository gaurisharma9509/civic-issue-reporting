// ======================
// 🔥 FIREBASE IMPORTS
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    increment,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// 🔥 FIREBASE CONFIG
// ======================
const firebaseConfig = {
    apiKey: "AIzaSyC1VlG4lXsJ7x0k6t_UdfEXULlIf1QaT3Q",
    authDomain: "civicissuereportingplatform.firebaseapp.com",
    projectId: "civicissuereportingplatform",
    storageBucket: "civicissuereportingplatform.firebasestorage.app",
    messagingSenderId: "764704688619",
    appId: "1:764704688619:web:fe44c0180535d9eb3f31ae"
};

// ======================
// 🔥 INITIALIZE FIREBASE
// ======================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const user = JSON.parse(localStorage.getItem("user"));

// ======================
// 📍 LOCATION
// ======================
window.currentLat = null;
window.currentLng = null;

window.addEventListener("load", () => {
    const locationInput = document.getElementById("location");

    if (navigator.geolocation && locationInput) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.currentLat = position.coords.latitude;
                window.currentLng = position.coords.longitude;

                locationInput.value =
                    `${window.currentLat}, ${window.currentLng}`;
            },
            () => {
                locationInput.value = "Location unavailable";
            }
        );
    }
});

// ======================
// 📍 READABLE LOCATION
// ======================
async function getReadableLocation(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        return data.display_name || `${lat}, ${lng}`;
    } catch {
        return `${lat}, ${lng}`;
    }
}

// ======================
// 🤖 AI HELPERS
// ======================
function detectCategory(text) {
    text = text.toLowerCase();

    if (text.includes("garbage")) return "Garbage";
    if (text.includes("road") || text.includes("pothole")) return "Road";
    if (text.includes("water")) return "Water";
    if (text.includes("light")) return "Street Light";
    if (text.includes("drain")) return "Drainage";

    return "Other";
}

function detectPriority(text) {
    return text.toLowerCase().includes("urgent")
        ? "High"
        : "Normal";
}

function detectSeverity(text) {
    return text.toLowerCase().includes("danger")
        ? "Critical"
        : "Moderate";
}

function assignDepartment(category) {
    const departments = {
        Garbage: "Sanitation Department",
        Road: "Road Repair Department",
        Water: "Water Supply Department",
        "Street Light": "Electrical Maintenance",
        Drainage: "Drainage Department",
        Other: "General Administration"
    };

    return departments[category] || "General Administration";
}

function generateTitle(text) {
    return text.split(" ").slice(0, 5).join(" ");
}

// ======================
// 🤖 AUTO FILL
// ======================
const descriptionInput = document.getElementById("description");

if (descriptionInput) {
    descriptionInput.addEventListener("input", () => {
        const text = descriptionInput.value;

        const category = detectCategory(text);

        document.getElementById("title").value =
            generateTitle(text);

        document.getElementById("category").value =
            category;

        document.getElementById("priority").value =
            detectPriority(text);

        document.getElementById("severity").value =
            detectSeverity(text);

        document.getElementById("department").value =
            assignDepartment(category);
    });
}

// ======================
// 📝 SUBMIT ISSUE
// ======================
const form = document.getElementById("issueForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const file =
            document.getElementById("image")?.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = async () => {
                await saveIssue(reader.result);
            };

            reader.readAsDataURL(file);
        } else {
            await saveIssue("");
        }
    });
}

// ======================
// 💾 SAVE ISSUE
// ======================
async function saveIssue(image) {
    try {
        const lat = window.currentLat;
        const lng = window.currentLng;

        const location = lat && lng
            ? await getReadableLocation(lat, lng)
            : "Location unavailable";

        await addDoc(collection(db, "issues"), {
            title: document.getElementById("title").value,
            category: document.getElementById("category").value,
            description: document.getElementById("description").value,
            priority: document.getElementById("priority").value,
            department: document.getElementById("department").value,
            severity: document.getElementById("severity").value,
            location,
            lat,
            lng,
            image,
            resolutionPhoto: "",
            status: "Pending",
            upvotes: 0,
            userId: user ? user.email : "guest",
            timestamp: serverTimestamp()
        });

        alert("✅ Issue Reported Successfully");

        form.reset();

    } catch (error) {
        console.error(error);
        alert("❌ Error saving issue");
    }
}

// ======================
// 📋 LOAD ISSUES
// ======================
const issueList = document.getElementById("issueList");

if (issueList) {
    onSnapshot(collection(db, "issues"), (snapshot) => {
        issueList.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            const statusBadge =
                data.status === "Resolved"
                    ? `<span class="badge bg-success">Resolved</span>`
                    : data.status === "In Progress"
                    ? `<span class="badge bg-warning text-dark">In Progress</span>`
                    : `<span class="badge bg-danger">Pending</span>`;

            const img = data.image
                ? `<img src="${data.image}" width="80">`
                : "No Image";

            issueList.innerHTML += `
            <tr>
                <td>${data.title}</td>
                <td>${data.category}</td>
                <td>${data.location}</td>
                <td>${statusBadge}</td>
                <td>${img}</td>
                <td>${data.upvotes || 0}</td>
                <td>
                    <button onclick="upvoteIssue('${docSnap.id}')"
                    class="btn btn-success btn-sm">👍</button>
                </td>
                <td>
                    ${
                        data.status !== "Resolved"
                        ? `
                        <input type="file"
                        id="resolve-${docSnap.id}"
                        class="form-control form-control-sm mb-2">

                        <button
                        onclick="resolveIssue('${docSnap.id}')"
                        class="btn btn-primary btn-sm">
                            Resolve
                        </button>
                        `
                        : "✅ Done"
                    }
                </td>
            </tr>
            `;
        });
    });
}

// ======================
// 👍 UPVOTE
// ======================
window.upvoteIssue = async function(id) {
    try {
        await updateDoc(doc(db, "issues", id), {
            upvotes: increment(1)
        });
    } catch (error) {
        console.error(error);
    }
};

// ======================
// ✅ RESOLVE ISSUE
// ======================
window.resolveIssue = async function(id) {
    try {
        const fileInput =
            document.getElementById(`resolve-${id}`);

        const file = fileInput.files[0];

        if (!file) {
            alert("Upload proof image");
            return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
            await updateDoc(doc(db, "issues", id), {
                status: "Resolved",
                resolutionPhoto: reader.result
            });

            alert("✅ Issue marked resolved");
        };

        reader.readAsDataURL(file);

    } catch (error) {
        console.error(error);
        alert("❌ Resolve failed");
    }
};

// ======================
// 📊 LIVE STATS
// ======================
const totalEl = document.getElementById("totalCount");
const pendingEl = document.getElementById("pendingCount");
const progressEl = document.getElementById("progressCount");
const resolvedEl = document.getElementById("resolvedCount");

if (totalEl) {
    onSnapshot(collection(db, "issues"), (snapshot) => {
        let total = 0;
        let pending = 0;
        let progress = 0;
        let resolved = 0;

        snapshot.forEach((docSnap) => {
            total++;

            const status = docSnap.data().status;

            if (status === "Pending") pending++;
            else if (status === "In Progress") progress++;
            else if (status === "Resolved") resolved++;
        });

        totalEl.innerText = total;
        pendingEl.innerText = pending;
        progressEl.innerText = progress;
        resolvedEl.innerText = resolved;
    });
}

// ======================
// 🖼 IMAGE FEED
// ======================
const imageContainer =
    document.getElementById("imageScroll");

if (imageContainer) {
    onSnapshot(collection(db, "issues"), (snapshot) => {
        let content = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            if (data.image) {
                content += `
                <div class="image-card">
                    <img src="${data.image}">
                </div>
                `;
            }
        });

        imageContainer.innerHTML =
            content || "No images";
    });
}