# Habit Tracker

The Habit Tracker app is a web-based application designed to help users create and track their daily habits. With a user-friendly interface, the app allows users to add, edit, complete, and delete habits, while keeping a streak counter to track progress.

## Features

### 1. **Habit Management**
- Users can **add** new habits.
- Mark habits as **completed** once they've finished.
- **Delete** habits when no longer needed.
- Tracks **streaks** of completed habits, encouraging consistency.

### 2. **Biometric Authentication**
- In addition to **Firebase Authentication**, the app supports **Biometric Authentication** using the **Web Authentication API**.
- Users can **register** their biometric data (e.g., fingerprint or facial recognition).

### 3. **Habit Filters**
- Users can filter their habits based on their **status**:
  - **All** habits (both completed and pending)
  - **Completed** habits only
  - **Pending** habits only

### 5. **Chatbot Integration**
- The app also includes an **AI-powered chatbot** for user assistance.

## Live Site
- Visit the live version of the app here: [Habit Tracker - Live Site](https://yogesh390.github.io/habit-tracker/)

## Setup Instructions

To set up and run the Habit Tracker app locally, follow these steps:

### Prerequisites:
- A modern **web browser** (e.g., Chrome, Firefox, Safari, Edge) with support for the **Web Authentication API** for biometric authentication.
- A **Firebase account** to set up Firebase Authentication and Firestore.

### Steps to Run the App Locally:

1. **Clone or Download the Repository**:
   - Clone the repository to your local machine:
     ```bash
     git clone https://github.com/yogesh390/habit-tracker.git
     ```
   - Or, you can download the ZIP file of the repository from GitHub and extract it to a local directory.

2. **Set Up Firebase**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new Firebase project if you don't already have one.
   - Enable **Firebase Authentication** and **Firestore** in the Firebase console.
   - Generate a Firebase configuration file with your project's credentials by following [this guide](https://firebase.google.com/docs/web/setup).
   - Replace the Firebase configuration in the `firebase-config.js` file with your credentials. 
     ```js
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
     };
     ```

3. **Open the App**:
   - Once you have cloned or downloaded the repository, open the `index.html` file in your web browser.
   - The app will run locally, and you should be able to use Firebase Authentication, including **biometric authentication** if your browser supports it.

4. **Using Biometric Authentication**:
   - The app uses the **Web Authentication API** for biometric login. Make sure your browser supports this API (e.g., Chrome, Firefox, Edge).
   - The biometric authentication is triggered by clicking the **"Login with Biometric"** button, and you need to register your biometric credentials first using the **"Register Biometric"** button.

5. **Interacting with the App**:
   - After logging in, you can add, edit, and delete habits.
   - Use the **filters** to view all, completed, or pending habits.
   - The habit data is stored in **Firestore** and can be accessed from any device after logging in with the same Firebase account.

---

If you encounter any issues during setup or have any questions, feel free to open an issue in the GitHub repository.
