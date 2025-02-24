import { db, auth } from "./firebase-config.js";
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

const habitList = document.getElementById("habit-list");
let currentFilter = "all"; // Default filter

// Function to fetch and display habits for the authenticated user
async function loadHabits() {
  habitList.innerHTML = "";

  // Ensure the user is logged in
  const user = auth.currentUser;
  if (!user) {
    habitList.innerHTML = "Please log in to view your habits.";
    return;
  }

  // Query habits that belong to the current user
  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", user.uid)
  );

  // Pass the query directly to getDocs()
  const querySnapshot = await getDocs(habitsQuery);
  const today = new Date().toDateString();

  querySnapshot.forEach((habitDoc) => {
    const habit = habitDoc.data();
    const habitId = habitDoc.id;

    // Filter habits based on selection
    const isCompletedToday = habit.completedDays?.includes(today);
    if (currentFilter === "completed" && !isCompletedToday) return;
    if (currentFilter === "pending" && isCompletedToday) return;

    const li = document.createElement("li");

    // Checkbox to mark completion
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompletedToday;
    checkbox.addEventListener("change", async () => {
      await toggleHabitCompletion(habitId, checkbox.checked);
      loadHabits();
    });

    // Habit Name display (editable on click)
    const nameDisplay = document.createElement("span");
    nameDisplay.textContent = habit.name;

    // Streak Counter with fire icon
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
        // Switch to edit mode: replace span with input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = nameDisplay.textContent;
        inputField.style.fontSize = "16px";
        li.replaceChild(inputField, nameDisplay);
        editBtn.innerHTML = "Save";
        isEditing = true;
      } else {
        // Save mode: update habit name in Firestore
        const inputField = li.querySelector("input[type=text]");
        const newName = inputField.value.trim();
        if (newName === "") {
          alert("Habit name cannot be empty.");
          return;
        }
        try {
          const habitRef = doc(db, "habits", habitId);
          await updateDoc(habitRef, { name: newName });
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

    // Append elements to list item
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

// Function to calculate habit streak from an array of completed dates
function calculateStreak(completedDays = []) {
  if (!completedDays.length) return 0;

  const sortedDates = completedDays
    .map((date) => new Date(date).getTime())
    .sort((a, b) => b - a);
  let streak = 1;
  let prevDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    let currentDate = new Date(sortedDates[i]);
    let diff = (prevDate - currentDate) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
      prevDate = currentDate;
    } else {
      break;
    }
  }
  return streak;
}

// Toggle habit completion status and update Firestore
async function toggleHabitCompletion(habitId, isChecked) {
  const habitRef = doc(db, "habits", habitId);
  // Get the current habit data by querying the habits collection
  const habitSnapshot = await getDocs(collection(db, "habits"));
  let habitData;

  habitSnapshot.forEach((docSnap) => {
    if (docSnap.id === habitId) {
      habitData = docSnap.data();
    }
  });

  if (habitData) {
    let completedDays = habitData.completedDays || [];
    const today = new Date().toDateString();

    if (isChecked) {
      completedDays.push(today);
    } else {
      completedDays = completedDays.filter((day) => day !== today);
    }

    await updateDoc(habitRef, { completedDays });
  }
}

// Delete a habit from Firestore
async function deleteHabit(habitId) {
  if (confirm("Are you sure you want to delete this habit?")) {
    await deleteDoc(doc(db, "habits", habitId));
    loadHabits();
  }
}

// Add a new habit to Firestore, associating it with the current user
document
  .getElementById("add-habit-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to add habits.");
      return;
    }

    const habitName = document.getElementById("habit-name").value;
    if (habitName.trim() === "") return;

    try {
      await addDoc(collection(db, "habits"), {
        name: habitName,
        completedDays: [],
        userId: user.uid, // Associate habit with the current user
      });
      document.getElementById("habit-name").value = "";
      loadHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  });

// Load habits on startup
loadHabits();
