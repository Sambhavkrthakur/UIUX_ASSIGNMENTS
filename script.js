// Load visitors from LocalStorage
let visitors = JSON.parse(localStorage.getItem("visitors") || "[]");

// Save to LocalStorage
function saveToStorage() {
  localStorage.setItem("visitors", JSON.stringify(visitors));
}

// Clock
function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString();
  }
}
setInterval(updateClock, 1000);
updateClock();

// Add Visitor from full form (Add Visitor page)
function addVisitor() {
  const nameInput = document.getElementById("vName");
  // If form not present on this page, do nothing
  if (!nameInput) return;

  const contactInput = document.getElementById("vContact");
  const purposeInput = document.getElementById("vPurpose");
  const hostInput = document.getElementById("vHost");

  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();
  const purpose = purposeInput.value.trim();
  const host = hostInput.value.trim();

  if (!name || !contact || !purpose || !host) {
    alert("Please fill all fields!");
    return;
  }

  const visitor = {
    id: visitors.length + 1,
    name,
    contact,
    purpose,
    host,
    timeIn: new Date().toLocaleTimeString(),
    timeOut: "-"
  };

  visitors.push(visitor);
  saveToStorage();
  clearInputs();
  updateStats();
  updateTable();
  alert("Visitor added successfully.");
}

// Quick Add from Dashboard
function addQuickVisitor() {
  const qName = document.getElementById("qName");
  if (!qName) return; // not on this page

  const qContact = document.getElementById("qContact");
  const qPurpose = document.getElementById("qPurpose");
  const qHost = document.getElementById("qHost");

  const name = qName.value.trim();
  const contact = qContact.value.trim();
  const purpose = qPurpose.value.trim();
  const host = qHost.value.trim();

  if (!name || !contact || !purpose || !host) {
    alert("Please fill all quick-add fields!");
    return;
  }

  const visitor = {
    id: visitors.length + 1,
    name,
    contact,
    purpose,
    host,
    timeIn: new Date().toLocaleTimeString(),
    timeOut: "-"
  };

  visitors.push(visitor);
  saveToStorage();
  clearInputs();
  updateStats();
  updateTable();
  alert("Visitor added successfully.");
}

// Build Logs Table (Logs page)
function updateTable() {
  const tbody = document.querySelector("#visitorTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  visitors.forEach((v) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.id}</td>
      <td>${v.name}</td>
      <td>${v.contact}</td>
      <td>${v.purpose}</td>
      <td>${v.host}</td>
      <td>${v.timeIn}</td>
      <td>${v.timeOut}</td>
      <td>
        ${
          v.timeOut === "-"
            ? `<button class="mark-exit" onclick="markExit(${v.id})">Mark Exit</button>`
            : "Exited"
        }
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Mark visitor exit
function markExit(id) {
  const visitor = visitors.find((v) => v.id === id);
  if (!visitor) return;

  visitor.timeOut = new Date().toLocaleTimeString();
  saveToStorage();
  updateTable();
  updateStats();
}

// Update Dashboard stats (Dashboard page)
function updateStats() {
  const totalEl = document.getElementById("totalVisitors");
  const insideEl = document.getElementById("insideNow");
  const outEl = document.getElementById("checkedOut");

  if (totalEl) totalEl.textContent = visitors.length;
  if (insideEl) insideEl.textContent = visitors.filter((v) => v.timeOut === "-").length;
  if (outEl) outEl.textContent = visitors.filter((v) => v.timeOut !== "-").length;
}

// Clear input fields (both forms)
function clearInputs() {
  const ids = ["vName", "vContact", "vPurpose", "vHost", "qName", "qContact", "qPurpose", "qHost"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// Search visitors in logs
function searchVisitor() {
  const input = document.getElementById("searchBar");
  if (!input) return;

  const query = input.value.toLowerCase();
  const rows = document.querySelectorAll("#visitorTable tbody tr");

  rows.forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}

// Export CSV of all visitors
function exportCSV() {
  if (!visitors.length) {
    alert("No data to export.");
    return;
  }

  let csv = "ID,Name,Contact,Purpose,Host,Time In,Time Out\n";
  visitors.forEach((v) => {
    csv += `${v.id},${v.name},${v.contact},${v.purpose},${v.host},${v.timeIn},${v.timeOut}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "visitor_logs.csv";
  link.click();
}

// Clear all history
function clearHistory() {
  const confirmDelete = confirm(
    "Are you sure you want to clear all visitor history? This cannot be undone."
  );
  if (!confirmDelete) return;

  visitors = [];
  saveToStorage();
  updateTable();
  updateStats();
  alert("Visitor history has been cleared.");
}

// Initialize page
window.addEventListener("DOMContentLoaded", () => {
  updateClock();
  updateStats();
  updateTable();
});
