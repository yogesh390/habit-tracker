// biometric.js

// Register a new biometric credential
export async function registerBiometric() {
  if (!window.PublicKeyCredential) {
    alert("WebAuthn API is not supported on this browser.");
    return;
  }

  // In a real-world app, the challenge and user ID should come from your server.
  const publicKey = {
    challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    rp: { name: "Habit Tracker" },
    user: {
      id: Uint8Array.from("unique-user-id", (c) => c.charCodeAt(0)),
      name: "user@example.com", // Replace with dynamic user info
      displayName: "User",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // Using ES256
    timeout: 60000,
    attestation: "none",
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    console.log("Credential created:", credential);
    alert("Biometric registration successful!");
    // In a real application, send the credential to your server for verification/storage.

    // Auto-login after successful registration (mimicking "continue with Google")
    await authenticateBiometric();
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

  // In production, your server should provide the proper challenge and allowed credential IDs.
  const publicKey = {
    challenge: Uint8Array.from("random-challenge", (c) => c.charCodeAt(0)),
    timeout: 60000,
    allowCredentials: [
      {
        type: "public-key",
        // Replace with the credential ID stored during registration
        id: Uint8Array.from("credential-id", (c) => c.charCodeAt(0)),
      },
    ],
    userVerification: "preferred",
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    console.log("Assertion received:", assertion);
    alert("Biometric authentication successful!");
    // Send the assertion to your server for verification here.
    // On successful verification, update the application state to "logged in":
    handleSuccessfulLogin();
  } catch (error) {
    console.error("Error during biometric authentication:", error);
    alert("Biometric authentication failed.");
  }
}

// Handle successful login, e.g., update UI or trigger Firebase sign-in
function handleSuccessfulLogin() {
  // Example: hide the login/register UI and display the main app content.
  document.getElementById("app-content").style.display = "block";
  document.getElementById("login-ui").style.display = "none";
  // Optionally, integrate with Firebase Authentication here.
}

// Wire up the buttons to the respective functions
document
  .getElementById("register-biometric")
  .addEventListener("click", registerBiometric);
document
  .getElementById("authenticate-biometric")
  .addEventListener("click", authenticateBiometric);
