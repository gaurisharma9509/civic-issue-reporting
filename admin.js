// 🔐 Protect page
if (localStorage.getItem("adminLoggedIn") !== "true") {
    alert("Access Denied!");
    window.location.href = "admin-login.html";
}

// ======================
// 🔥 FIREBASE IMPORTS
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    updateDoc,
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
    appId: "1:764704688619:web:fe44c0180535d9eb3f31ae",
    measurementId: "G-38XMHQY4S0"
};

// ======================
// 🔥 INIT
// ======================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminIssueList = document.getElementById("adminIssueList");

// ======================
// 📊 REFRESH CHART
// ======================
function refreshChart() {
    if (window.updateChart) {
        setTimeout(() => {
            window.updateChart();
        }, 300);
    }
}

// ======================
// 🔴 REAL TIME LOAD ISSUES
// ======================
function loadAdminIssues() {
    onSnapshot(collection(db, "issues"), (snapshot) => {
        adminIssueList.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            adminIssueList.innerHTML += `
            <tr>
                <td>${data.title}</td>
                <td>${data.category}</td>
                <td>${data.location}</td>
                <td>${data.status}</td>
                <td>
                    <select 
                        onchange="updateStatus('${id}', this.value)" 
                        class="form-select">

                        <option value="Pending" ${data.status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="In Progress" ${data.status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Resolved" ${data.status === "Resolved" ? "selected" : ""}>
                            Resolved
                        </option>
                    </select>
                </td>
            </tr>
            `;
        });

        refreshChart();
    });
}

loadAdminIssues();

// ======================
// ✅ UPDATE STATUS
// ======================
window.updateStatus = async function(id, newStatus) {
    try {
        if (!newStatus) return;

        const issueRef = doc(db, "issues", id);

        await updateDoc(issueRef, {
            status: newStatus
        });

        alert("✅ Status Updated");

    } catch (error) {
        console.error(error);
        alert("❌ Failed to update");
    }
};