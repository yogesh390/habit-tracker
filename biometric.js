import { db, auth } from "./firebase-config.js"; // Adjust the path as necessary
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const registerBtn = document.getElementById("register-biometric");
const loginBtn = document.getElementById("authenticate-biometric");

// Function to generate and store a unique user ID
function generateUserId() {
  return crypto.randomUUID(); // Generates a unique ID
}

// Function to get or create a user ID
function getOrCreateUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem("userId", userId);
  }
  return userId;
}

// Function to fetch the challenge from the server
async function fetchChallenge() {
  // Replace with your logic to fetch a challenge from your server
  return new Uint8Array([
    /* your challenge from server */
  ]);
}

// Utility function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

registerBtn.addEventListener("click", async () => {
  try {
    // Retrieve or create the user ID
    const userId = getOrCreateUserId(); // Dynamically get or create a unique user ID
    console.log(`Registering biometric credentials for user ID: ${userId}`);

    const challenge = await fetchChallenge();
    const publicKey = {
      challenge: challenge,
      rp: { name: "Demo App" },
      user: {
        id: new TextEncoder().encode(userId), // Use dynamic user ID
        name: "user@example.com", // Use a dynamic name or email
        displayName: "User", // You can customize this
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }], // Supported algorithm
      timeout: 60000,
    };

    const credential = await navigator.credentials.create({ publicKey });

    // Convert and store biometric credential data (for future login)
    const credentialId = credential.id;
    const rawId = arrayBufferToBase64(credential.rawId);
    const attestationObject = arrayBufferToBase64(
      credential.response.attestationObject
    );
    const clientDataJSON = arrayBufferToBase64(
      credential.response.clientDataJSON
    );

    // Store the biometric credential data in Firestore under the dynamic user ID
    await setDoc(doc(db, "users", userId), {
      credentialId: credentialId,
      rawId: rawId,
      attestationObject: attestationObject,
      clientDataJSON: clientDataJSON,
    });

    console.log("Biometric registration successful.");
  } catch (error) {
    console.error("Registration failed", error);
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  try {
    const userId = localStorage.getItem("userId"); // Retrieve stored user ID
    if (!userId) {
      console.error("No user ID found. Please register first.");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      console.error("No registered credentials found. Please register first.");
      return;
    }

    const storedCredential = userDoc.data();
    const challenge = await fetchChallenge();

    const publicKey = {
      challenge: challenge,
      allowCredentials: [
        {
          id: new Uint8Array(
            atob(storedCredential.rawId)
              .split("")
              .map((c) => c.charCodeAt(0))
          ), // Convert Base64 back to Uint8Array
          type: "public-key",
        },
      ],
      timeout: 60000,
    };

    const assertion = await navigator.credentials.get({ publicKey });

    console.log(`Authentication successful for user: ${userId}`, assertion);
  } catch (error) {
    console.error("Authentication failed", error);
  }
});
