import {
  signInAnonymously,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

export async function registerBiometric() {
  const user = getAuth().currentUser;

  if (!user) {
    alert("You must be signed in to register biometric authentication.");
    return;
  }

  if (!window.PublicKeyCredential) {
    alert("WebAuthn API is not supported on this browser.");
    return;
  }

  const publicKey = {
    challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    rp: { name: "Habit Tracker" },
    user: {
      id: Uint8Array.from(user.uid, (c) => c.charCodeAt(0)),
      name: user.uid,
      displayName: "Anonymous User",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    timeout: 60000,
    attestation: "none",
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    console.log("Credential created:", credential);
    alert("Biometric registration successful!");

    await handleSuccessfulLogin();
  } catch (error) {
    console.error("Error during biometric registration:", error);
    alert("Biometric registration failed.");
  }
}

export async function authenticateBiometric() {
  const user = getAuth().currentUser;

  if (!user) {
    alert("You must be signed in to authenticate biometric.");
    return;
  }

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
        id: Uint8Array.from(user.uid, (c) => c.charCodeAt(0)),
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

async function handleSuccessfulLogin() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("User signed in anonymously:", userCredential.user);

    document.getElementById("app-content").style.display = "block";
    document.getElementById("login-ui").style.display = "none";
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    alert("Authentication failed. Please try again.");
  }
}

document
  .getElementById("register-biometric")
  .addEventListener("click", registerBiometric);
document
  .getElementById("authenticate-biometric")
  .addEventListener("click", authenticateBiometric);
