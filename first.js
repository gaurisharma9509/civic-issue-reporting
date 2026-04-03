// 🔥 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC1VlG4lXsJ7x0k6t_UdfEXULlIf1QaT3Q",
  authDomain: "civicissuereportingplatform.firebaseapp.com",
  projectId: "civicissuereportingplatform",
  storageBucket: "civicissuereportingplatform.firebasestorage.app",
  messagingSenderId: "764704688619",
  appId: "1:764704688619:web:fe44c0180535d9eb3f31ae"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// 🔘 BUTTON HANDLERS
// ============================

// REPORT BUTTON
const reportBtn = document.getElementById("reportBtn");
if (reportBtn) {
    reportBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

// LEARN BUTTON
const learnBtn = document.getElementById("learnBtn");
if (learnBtn) {
    learnBtn.addEventListener("click", () => {
        document.getElementById("howItWorks")?.scrollIntoView({
            behavior: "smooth"
        });
    });
}

// ============================
// 👤 SIGNUP
// ============================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
        const name = document.getElementById("fullName")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const fileInput = document.getElementById("profilePic");

        if (!name || !email || !password) {
            alert("Please fill all fields!");
            return;
        }

        let imageName = fileInput?.files[0]?.name || "default.png";

        try {
            await addDoc(collection(db, "users"), {
                name,
                email,
                password,
                profilePic: imageName,
                createdAt: serverTimestamp()
            });

            alert("User registered successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving user");
        }
    });
}

// ============================
// 💬 COMMENT SYSTEM (UPGRADED)
// ============================

const popup = document.getElementById("commentPopup");
const overlay = document.getElementById("overlay");
const openCommentBtn = document.getElementById("openCommentBox");
const submitComment = document.getElementById("submitComment");
const commentInput = document.getElementById("commentText");
const commentsFeed = document.getElementById("commentsFeed");

// Example (later dynamic)
const issueId = "general";
const user = "Anonymous";

// ✅ OPEN POPUP (WITH OVERLAY)
if (openCommentBtn) {
    openCommentBtn.addEventListener("click", () => {
        popup?.classList.remove("hidden");
        overlay?.classList.remove("hidden");
    });
}

// ✅ CLOSE POPUP (CLICK OUTSIDE)
if (overlay) {
    overlay.addEventListener("click", () => {
        popup?.classList.add("hidden");
        overlay.classList.add("hidden");
    });
}

// ✅ ADD COMMENT
if (submitComment) {
    submitComment.addEventListener("click", async () => {
        const text = commentInput?.value.trim();

        if (!text) {
            alert("Please write a comment!");
            return;
        }

        try {
            await addDoc(collection(db, "comments"), {
                comment: text,
                issueid: issueId,
                user: user,
                createdAt: serverTimestamp()
            });

            // Clear input + close popup
            commentInput.value = "";
            popup.classList.add("hidden");
            overlay.classList.add("hidden");

        } catch (err) {
            console.error(err);
            alert("Error posting comment");
        }
    });
}

// ============================
// 🔴 REAL-TIME COMMENTS
// ============================

if (commentsFeed) {
    const q = query(
        collection(db, "comments"),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
        commentsFeed.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();

            const div = document.createElement("div");
            div.classList.add("comment-card");

            div.innerHTML = `
                <img src="image/user.png" class="comment-avatar">
                <div>
                    <strong>${data.user || "User"}</strong>
                    <p>${data.comment}</p>
                </div>
            `;

            commentsFeed.appendChild(div);
        });
    });
}