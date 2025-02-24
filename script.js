import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const habitList = document.getElementById("habit-list");

// Function to fetch and display habits
let currentFilter = "all"; // Default filter

async function loadHabits() {
  habitList.innerHTML = "";

  const user = auth.currentUser;
  if (!user) {
    habitList.innerHTML = "Please log in to view your habits.";
    return;
  }

  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", user.uid)
  );

  const querySnapshot = await getDocs(collection(habitsQuery));
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

    // Habit Name display (will be replaced with an input when editing)
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
    // We'll use a flag to check if the item is in edit mode
    let isEditing = false;
    editBtn.addEventListener("click", async () => {
      if (!isEditing) {
        // Switch to edit mode: replace the span with an input field.
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = nameDisplay.textContent;
        inputField.style.fontSize = "16px";
        li.replaceChild(inputField, nameDisplay);
        editBtn.innerHTML = "Save";
        isEditing = true;
      } else {
        // Save mode: update Firebase with new name.
        const inputField = li.querySelector("input[type=text]");
        const newName = inputField.value.trim();
        if (newName === "") {
          alert("Habit name cannot be empty.");
          return;
        }
        try {
          const habitRef = doc(db, "habits", habitId);
          await updateDoc(habitRef, { name: newName });
          // After updating, switch back to display mode.
          nameDisplay.textContent = newName;
          li.replaceChild(nameDisplay, inputField);
          editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
          isEditing = false;
        } catch (error) {
          console.error("Error updating habit:", error);
        }
      }
    });

    // Delete Button with Font Awesome Icon
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

// Function to calculate habit streak
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

async function toggleHabitCompletion(habitId, isChecked) {
  const habitRef = doc(db, "habits", habitId);
  const habitSnapshot = await getDocs(collection(db, "habits"));
  let habitData;

  habitSnapshot.forEach((doc) => {
    if (doc.id === habitId) {
      habitData = doc.data();
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

async function deleteHabit(habitId) {
  if (confirm("Are you sure you want to delete this habit?")) {
    await deleteDoc(doc(db, "habits", habitId));
    loadHabits();
  }
}

document
  .getElementById("add-habit-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const habitName = document.getElementById("habit-name").value;

    if (habitName.trim() === "") return;

    try {
      await addDoc(collection(db, "habits"), {
        name: habitName,
        completedDays: [],
      });
      document.getElementById("habit-name").value = "";
      loadHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  });

loadHabits();
