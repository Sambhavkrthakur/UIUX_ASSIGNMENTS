const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Load tasks from localStorage when page loads
window.onload = function () {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => createTaskElement(task.title, task.description, task.completed));
};

// Add new task
addTaskBtn.addEventListener("click", function () {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();

  if (title === "" || description === "") {
    alert("Please enter both title and description!");
    return;
  }

  createTaskElement(title, description, false);
  saveTasksToLocalStorage();

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
});

// Create task UI element
function createTaskElement(title, description, completed) {
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task");
  if (completed) taskDiv.classList.add("completed");

  taskDiv.innerHTML = `
    <h3>${title}</h3>
    <p>${description}</p>
    <button class="markBtn">${completed ? "Mark Incomplete" : "Mark Completed"}</button>
    <button class="editBtn">Edit</button>
    <button class="deleteBtn">Delete</button>
  `;

  // Mark as Completed / Incomplete
  taskDiv.querySelector(".markBtn").addEventListener("click", function () {
    taskDiv.classList.toggle("completed");
    this.textContent = taskDiv.classList.contains("completed")
      ? "Mark Incomplete"
      : "Mark Completed";
    saveTasksToLocalStorage();
  });

  // Delete task
  taskDiv.querySelector(".deleteBtn").addEventListener("click", function () {
    taskDiv.remove();
    saveTasksToLocalStorage();
  });

  // Edit task
  taskDiv.querySelector(".editBtn").addEventListener("click", function () {
    const h3 = taskDiv.querySelector("h3");
    const p = taskDiv.querySelector("p");

    const newTitle = prompt("Edit Task Title:", h3.textContent);
    const newDesc = prompt("Edit Task Description:", p.textContent);

    if (newTitle !== null && newDesc !== null) {
      h3.textContent = newTitle;
      p.textContent = newDesc;
      saveTasksToLocalStorage();
    }
  });

  taskList.appendChild(taskDiv);
}

// Save all tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll(".task").forEach(taskDiv => {
    const title = taskDiv.querySelector("h3").textContent;
    const description = taskDiv.querySelector("p").textContent;
    const completed = taskDiv.classList.contains("completed");
    tasks.push({ title, description, completed });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
