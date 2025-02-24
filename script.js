import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const habitList = document.getElementById("habit-list");

let currentFilter = "all";
let currentUser = null; // Store the authenticated user

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.uid);
    loadHabits();
  } else {
    currentUser = null;
    console.log("No user logged in");
    habitList.innerHTML = "<p>Please log in to see your habits.</p>";
  }
});

// Load habits for the logged-in user
async function loadHabits() {
  if (!currentUser) {
    habitList.innerHTML = "<p>Please log in to see your habits.</p>";
    return;
  }

  habitList.innerHTML = "";

  const habitsRef = collection(db, "habits");
  const q = query(habitsRef, where("userId", "==", currentUser.uid));
  const querySnapshot = await getDocs(q);

  const today = new Date().toDateString();

  querySnapshot.forEach((habitDoc) => {
    const habit = habitDoc.data();
    const habitId = habitDoc.id;

    const isCompletedToday = habit.completedDays?.includes(today);
    if (currentFilter === "completed" && !isCompletedToday) return;
    if (currentFilter === "pending" && isCompletedToday) return;

    const li = document.createElement("li");

    // Checkbox for marking completion
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompletedToday;
    checkbox.addEventListener("change", async () => {
      await toggleHabitCompletion(habitId, checkbox.checked);
      loadHabits();
    });

    const nameDisplay = document.createElement("span");
    nameDisplay.textContent = habit.name;

    const streakSpan = document.createElement("span");
    streakSpan.classList.add("streak-counter");
    streakSpan.innerHTML = `<i class="fas fa-fire"></i> ${calculateStreak(
      habit.completedDays
    )}`;

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    let isEditing = false;
    editBtn.addEventListener("click", async () => {
      if (!isEditing) {
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = nameDisplay.textContent;
        inputField.style.fontSize = "16px";
        li.replaceChild(inputField, nameDisplay);
        editBtn.innerHTML = "Save";
        isEditing = true;
      } else {
        const inputField = li.querySelector("input[type=text]");
        const newName = inputField.value.trim();
        if (newName === "") {
          alert("Habit name cannot be empty.");
          return;
        }
        try {
          await updateDoc(doc(db, "habits", habitId), { name: newName });
          nameDisplay.textContent = newName;
          li.replaceChild(nameDisplay, inputField);
          editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
          isEditing = false;
        } catch (error) {
          console.error("Error updating habit:", error);
        }
      }
    });

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    deleteBtn.addEventListener("click", async () => {
      await deleteHabit(habitId);
    });

    // Append elements
    li.appendChild(checkbox);
    li.appendChild(nameDisplay);
    li.appendChild(streakSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });
}

window.filterHabits = function (type) {
  currentFilter = type;
  loadHabits();
};

// Update habit completion
async function toggleHabitCompletion(habitId, isChecked) {
  const habitRef = doc(db, "habits", habitId);
  const today = new Date().toDateString();

  const habitSnapshot = await getDocs(collection(db, "habits"));
  let habitData;

  habitSnapshot.forEach((doc) => {
    if (doc.id === habitId) {
      habitData = doc.data();
    }
  });

  if (habitData) {
    let completedDays = habitData.completedDays || [];
    if (isChecked) {
      completedDays.push(today);
    } else {
      completedDays = completedDays.filter((day) => day !== today);
    }
    await updateDoc(habitRef, { completedDays });
  }
}

// Delete Habit
async function deleteHabit(habitId) {
  if (confirm("Are you sure you want to delete this habit?")) {
    await deleteDoc(doc(db, "habits", habitId));
    loadHabits();
  }
}

// Add Habit
document
  .getElementById("add-habit-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to add a habit.");
      return;
    }

    const habitName = document.getElementById("habit-name").value;

    if (habitName.trim() === "") return;

    try {
      await addDoc(collection(db, "habits"), {
        name: habitName,
        completedDays: [],
        userId: currentUser.uid, // Associate habit with logged-in user
      });
      document.getElementById("habit-name").value = "";
      loadHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  });

loadHabits();
