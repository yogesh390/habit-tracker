import { signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { auth } from "./firebase-config.js"; // Import Firebase auth

// Register a new biometric credential
export async function registerBiometric() {
  if (!window.PublicKeyCredential) {
    alert("WebAuthn API is not supported on this browser.");
    return;
  }

  const publicKey = {
    challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    rp: { name: "Habit Tracker" },
    user: {
      id: Uint8Array.from("unique-user-id", (c) => c.charCodeAt(0)),
      name: "user@example.com", // Replace with dynamic user info
      displayName: "User ",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // Using ES256
    timeout: 60000,
    attestation: "none",
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    console.log("Credential created:", credential);
    alert("Biometric registration successful!");

    // Directly log in the user after registration
    await handleSuccessfulLogin();
  } catch (error) {
    console.error("Error during biometric registration:", error);
    alert("Biometric registration failed.");
  }
}

// Authenticate using an existing biometric credential
export async function authenticateBiometric() {
  if (!window.PublicKeyCredential) {
    alert("WebAuthn API is not supported on this browser.");
    return;
  }

  const publicKey = {
    challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    timeout: 60000,
    allowCredentials: [
      {
        type: "public-key",
        id: Uint8Array.from("credential-id", (c) => c.charCodeAt(0)), // Replace with actual credential ID
      },
    ],
    userVerification: "preferred",
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    console.log("Assertion received:", assertion);
    alert("Biometric authentication successful!");
    await handleSuccessfulLogin();
  } catch (error) {
    console.error("Error during biometric authentication:", error);
    alert("Biometric authentication failed.");
  }
}

// Handle successful login
async function handleSuccessfulLogin() {
  try {
    // Sign in the user anonymously
    const userCredential = await signInAnonymously(auth);
    console.log("User signed in anonymously:", userCredential.user);

    // Show app content and hide login UI
    document.getElementById("app-content").style.display = "block";
    document.getElementById("login-ui").style.display = "none";
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    alert("Authentication failed. Please try again.");
  }
}

// Wire up the buttons to the respective functions
document
  .getElementById("register-biometric")
  .addEventListener("click", registerBiometric);
document
  .getElementById("authenticate-biometric")
  .addEventListener("click", authenticateBiometric);
