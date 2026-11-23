/**
 * ==============================================================================
 * CAMPUS LOST & FOUND — APP.JS
 * Implements all logic from manage.py, Management.py, Search&Claim_item.py,
 * report_found_item.py, and lost_item_reporting.py.
 * ==============================================================================
 */

// Initial Seed Data mirroring Python script
const INITIAL_USERS = {
  "pranav": {
    password: "123",
    role: "student",
    name: "Pranav Deshwal",
    student_id: "S26CSEU1917"
  },
  "security": {
    password: "123",
    role: "staff",
    name: "Security Desk Officer",
    student_id: "STF-C11-09"
  },
  "admin": {
    password: "admin",
    role: "administrator",
    name: "Campus Administrator",
    student_id: "ADM-MAIN-01"
  }
};

const INITIAL_ITEMS = [
  {
    id: 1,
    item_name: "Blue water bottle",
    category: "Bottle",
    description: "Stainless steel blue insulated flask with slight dent on base.",
    location: "Central Library",
    date: "2026-10-01",
    contact: "Security Desk",
    reported_by: "Campus Security Desk",
    status: "Found",
    claimed_by: null,
    photo: null
  },
  {
    id: 2,
    item_name: "Black Wallet",
    category: "Accessories",
    description: "Leather tri-fold wallet with ID cards and metro pass.",
    location: "C11 Ground Floor",
    date: "2026-10-02",
    contact: "Security Desk",
    reported_by: "Guard Ramesh",
    status: "Found",
    claimed_by: null,
    photo: null
  },
  {
    id: 3,
    item_name: "Calculator",
    category: "Study",
    description: "Casio fx-991EX scientific calculator with engraved initials on cover.",
    location: "Canteen",
    date: "2026-10-05",
    contact: "Canteen Counter",
    reported_by: "Canteen Staff",
    status: "Found",
    claimed_by: null,
    photo: null
  },
  {
    id: 4,
    item_name: "Casio Digital Watch",
    category: "Accessories",
    description: "Silver metallic strap digital watch lost during lecture.",
    location: "Auditorium Hall B",
    date: "2026-10-14",
    contact: "9811223344",
    reported_by: "Priya Sen",
    status: "Lost",
    claimed_by: null,
    photo: null
  },
  {
    id: 5,
    item_name: "HP Laptop Charger 65W",
    category: "Tech",
    description: "Blue-pin HP original laptop adapter left plugged in row 4.",
    location: "Computer Lab 304",
    date: "2026-10-18",
    contact: "9876543210",
    reported_by: "Rohan Mehta",
    status: "Lost",
    claimed_by: null,
    photo: null
  },
  {
    id: 6,
    item_name: "Room Keys with Red Tag",
    category: "Accessories",
    description: "Set of two brass keys on a red campus lanyard.",
    location: "Sports Complex",
    date: "2026-10-22",
    contact: "Gym Desk 1",
    reported_by: "Coach Sharma",
    status: "Claimed",
    claimed_by: "Devansh Roy (S26CSEU1840) - Proof: Dorm room #204 key verification",
    photo: null
  }
];

// Historical baseline of items claimed before digital logging
const HISTORICAL_CLAIMED_OFFSET = 18;

// Application State
let usersDb = {};
let itemsList = [];
let currentUsername = "pranav";
let activeCategoryFilter = "all";
let activeStatusFilter = "all";
let currentSearchQuery = "";

// ==============================================================================
// 1. INITIALIZATION & STORAGE
// ==============================================================================
function initApp() {
  loadDataFromStorage();
  renderCurrentUserUI();
  renderAccountsList();
  renderItemsGrid();
  renderRecordsTable();
  updateUnclaimedCount();
  updateClaimedStats();
  setupDateDefaults();
}

function loadDataFromStorage() {
  const savedUsers = localStorage.getItem("campus_users_db");
  const savedItems = localStorage.getItem("campus_items_list");
  const savedActiveUser = localStorage.getItem("campus_active_user");

  usersDb = savedUsers ? JSON.parse(savedUsers) : JSON.parse(JSON.stringify(INITIAL_USERS));
  itemsList = savedItems ? JSON.parse(savedItems) : JSON.parse(JSON.stringify(INITIAL_ITEMS));
  
  // Auto-migrate old demo user from Aryan to Pranav if present in localStorage
  if (usersDb["aryan"]) {
    delete usersDb["aryan"];
    usersDb["pranav"] = JSON.parse(JSON.stringify(INITIAL_USERS["pranav"]));
  }
  if (!usersDb["pranav"]) {
    usersDb["pranav"] = JSON.parse(JSON.stringify(INITIAL_USERS["pranav"]));
  }

  if (savedActiveUser && usersDb[savedActiveUser] && savedActiveUser !== "aryan") {
    currentUsername = savedActiveUser;
  } else {
    currentUsername = "pranav";
  }
}

function saveDataToStorage() {
  localStorage.setItem("campus_users_db", JSON.stringify(usersDb));
  localStorage.setItem("campus_items_list", JSON.stringify(itemsList));
  localStorage.setItem("campus_active_user", currentUsername);
}

function resetDemoData() {
  if (confirm("Reset all items and users back to original demo values?")) {
    localStorage.removeItem("campus_users_db");
    localStorage.removeItem("campus_items_list");
    localStorage.removeItem("campus_active_user");
    usersDb = JSON.parse(JSON.stringify(INITIAL_USERS));
    itemsList = JSON.parse(JSON.stringify(INITIAL_ITEMS));
    currentUsername = "pranav";
    saveDataToStorage();
    initApp();
    showToast("Demo records have been reset successfully!", "success");
  }
}

function setupDateDefaults() {
  const dateInput = document.getElementById("form-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

// Real-time counter of items claimed over all the time
function updateClaimedStats() {
  const claimedCount = itemsList.filter(i => i.status === "Claimed").length;
  const totalClaimed = HISTORICAL_CLAIMED_OFFSET + claimedCount;
  const statEl = document.getElementById("realtime-claimed-stat");
  if (statEl) {
    statEl.textContent = totalClaimed;
    statEl.style.transform = "scale(1.15)";
    setTimeout(() => { statEl.style.transform = "scale(1)"; }, 300);
  }
}

// ==============================================================================
// 2. EYE BUTTON PASSWORD VISIBILITY TOGGLE
// ==============================================================================
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const eyeOpen = btn.querySelector(".eye-open");
  const eyeClosed = btn.querySelector(".eye-closed");

  if (input.type === "password") {
    input.type = "text";
    if (eyeOpen) eyeOpen.style.display = "none";
    if (eyeClosed) eyeClosed.style.display = "block";
    btn.setAttribute("title", "Hide password");
  } else {
    input.type = "password";
    if (eyeOpen) eyeOpen.style.display = "block";
    if (eyeClosed) eyeClosed.style.display = "none";
    btn.setAttribute("title", "Show password");
  }
}

// ==============================================================================
// 3. PHOTO UPLOAD & CAMERA INTEGRATION
// ==============================================================================
// Triggered by the camera button on the main yellow card
function triggerHeroCameraUpload() {
  const heroFileInput = document.getElementById("hero-camera-file-input");
  if (heroFileInput) {
    heroFileInput.click();
  }
}

function handleHeroPhotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    applyPhotoToReportForm(dataUrl);

    // Scroll smoothly to report section
    const reportSection = document.getElementById("report-section");
    if (reportSection) {
      reportSection.scrollIntoView({ behavior: "smooth" });
    }

    showToast("📷 Photo attached! Fill in the item details to complete your report.", "success");
  };
  reader.readAsDataURL(file);
}

// Triggered by the dropzone inside the report form
function handleFormPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    applyPhotoToReportForm(e.target.result);
  };
  reader.readAsDataURL(file);
}

function applyPhotoToReportForm(dataUrl) {
  const dataInput = document.getElementById("form-photo-data");
  const preview = document.getElementById("report-photo-preview");
  const previewWrap = document.getElementById("dropzone-preview-wrap");
  const emptyState = document.getElementById("dropzone-empty");

  if (dataInput) dataInput.value = dataUrl;
  if (preview) preview.src = dataUrl;
  if (previewWrap) previewWrap.style.display = "flex";
  if (emptyState) emptyState.style.display = "none";
}

function removeReportPhoto() {
  const dataInput = document.getElementById("form-photo-data");
  const preview = document.getElementById("report-photo-preview");
  const previewWrap = document.getElementById("dropzone-preview-wrap");
  const emptyState = document.getElementById("dropzone-empty");
  const fileInput = document.getElementById("report-photo-file");
  const heroFileInput = document.getElementById("hero-camera-file-input");

  if (dataInput) dataInput.value = "";
  if (preview) preview.src = "";
  if (previewWrap) previewWrap.style.display = "none";
  if (emptyState) emptyState.style.display = "flex";
  if (fileInput) fileInput.value = "";
  if (heroFileInput) heroFileInput.value = "";
}

// ==============================================================================
// 4. USER MANAGEMENT MODULE (FROM manage.py)
// ==============================================================================
function renderCurrentUserUI() {
  const user = usersDb[currentUsername] || usersDb["pranav"];
  
  // Header pill
  const navUserLabel = document.getElementById("nav-user-label");
  const navAvatarInitials = document.getElementById("nav-avatar-initials");
  if (navUserLabel && navAvatarInitials) {
    const initials = user.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    navUserLabel.textContent = `${user.name} (${capitalize(user.role)})`;
    navAvatarInitials.textContent = initials;
  }

  // Profile Card
  const profileAvatar = document.getElementById("profile-avatar-large");
  const profileName = document.getElementById("profile-display-name");
  const profileRole = document.getElementById("profile-display-role");
  const profileUser = document.getElementById("profile-display-username");
  const profileId = document.getElementById("profile-display-id");

  if (profileAvatar) {
    profileAvatar.textContent = user.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  }
  if (profileName) profileName.textContent = user.name;
  if (profileRole) profileRole.textContent = user.role.toUpperCase();
  if (profileUser) profileUser.textContent = currentUsername;
  if (profileId) profileId.textContent = user.student_id || "N/A";

  // Auto-fill report form person name
  const personInput = document.getElementById("form-person");
  const idInput = document.getElementById("form-id-num");
  if (personInput && !personInput.value) personInput.value = user.name;
  if (idInput && !idInput.value && user.student_id) idInput.value = user.student_id;
}

function renderAccountsList() {
  const container = document.getElementById("accounts-list");
  if (!container) return;

  container.innerHTML = "";
  Object.keys(usersDb).forEach(username => {
    const user = usersDb[username];
    const isActive = username === currentUsername;

    const div = document.createElement("div");
    div.className = `account-item ${isActive ? 'active' : ''}`;
    div.onclick = () => switchActiveUser(username);

    div.innerHTML = `
      <div class="account-info">
        <span class="account-name">${user.name} ${isActive ? '• (Active)' : ''}</span>
        <span class="account-role">${capitalize(user.role)} • @${username}</span>
      </div>
      <button class="btn-outline btn-sm" onclick="event.stopPropagation(); switchActiveUser('${username}')">
        ${isActive ? 'Selected' : 'Switch'}
      </button>
    `;
    container.appendChild(div);
  });
}

function switchActiveUser(username) {
  if (usersDb[username]) {
    currentUsername = username;
    saveDataToStorage();
    renderCurrentUserUI();
    renderAccountsList();
    showToast(`Logged in as ${usersDb[username].name} (${capitalize(usersDb[username].role)})`, "success");
  }
}

function handleUpdateProfile() {
  const input = document.getElementById("profile-new-name");
  const newName = input.value.trim();

  if (!newName) {
    showToast("Please enter a valid new name.", "error");
    return;
  }

  // Update in memory & storage
  usersDb[currentUsername].name = newName;
  saveDataToStorage();
  input.value = "";
  renderCurrentUserUI();
  renderAccountsList();
  showToast("Profile name updated successfully!", "success");
}

function handleLogout() {
  showToast(`Logged out from ${usersDb[currentUsername].name}.`, "info");
  currentUsername = "pranav";
  saveDataToStorage();
  renderCurrentUserUI();
  renderAccountsList();
}

function openUserModal() {
  document.getElementById("user-modal").style.display = "flex";
}

function closeUserModal() {
  document.getElementById("user-modal").style.display = "none";
}

function switchAuthTab(tab) {
  const loginTab = document.getElementById("auth-tab-login");
  const regTab = document.getElementById("auth-tab-register");
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");

  if (tab === "login") {
    loginTab.classList.add("active");
    regTab.classList.remove("active");
    loginForm.style.display = "block";
    regForm.style.display = "none";
  } else {
    regTab.classList.add("active");
    loginTab.classList.remove("active");
    regForm.style.display = "block";
    loginForm.style.display = "none";
  }
}

function openLoginTab() {
  openUserModal();
  switchAuthTab("login");
}

function openRegisterTab() {
  openUserModal();
  switchAuthTab("register");
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  if (usersDb[username] && usersDb[username].password === password) {
    currentUsername = username;
    saveDataToStorage();
    renderCurrentUserUI();
    renderAccountsList();
    closeUserModal();
    showToast(`Login successful! Logged in as ${capitalize(usersDb[username].role)}.`, "success");
    document.getElementById("login-form").reset();
  } else {
    showToast("Invalid username or password.", "error");
  }
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  const username = document.getElementById("reg-username").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value;
  const fullName = document.getElementById("reg-fullname").value.trim();
  const role = document.getElementById("reg-role").value;

  if (usersDb[username]) {
    showToast("Username already exists. Please try logging in.", "error");
    return;
  }

  const prefix = role === "student" ? "S26CSEU" : (role === "staff" ? "STF" : "ADM");
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const genId = `${prefix}${randNum}`;

  usersDb[username] = {
    password: password,
    role: role,
    name: fullName,
    student_id: genId
  };

  currentUsername = username;
  saveDataToStorage();
  renderCurrentUserUI();
  renderAccountsList();
  closeUserModal();
  showToast(`Registration successful! Welcome, ${fullName}.`, "success");
  document.getElementById("register-form").reset();
}

// ==============================================================================
// 5. SEARCH & CLAIM MODULE (FROM Search&Claim_item.py)
// ==============================================================================
function handleSearch() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  currentSearchQuery = query;

  const clearBtn = document.getElementById("clear-search");
  if (clearBtn) {
    clearBtn.style.display = query ? "block" : "none";
  }

  renderItemsGrid();
}

function clearSearch() {
  const input = document.getElementById("search-input");
  input.value = "";
  currentSearchQuery = "";
  document.getElementById("clear-search").style.display = "none";
  renderItemsGrid();
}

function filterByCategory(category) {
  activeCategoryFilter = category;

  const chips = document.querySelectorAll("#category-chips .chip");
  chips.forEach(chip => {
    if (chip.textContent.toLowerCase() === category.toLowerCase() || 
        (category === 'all' && chip.textContent.includes('All'))) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });

  renderItemsGrid();
}

function quickCategoryJump(category) {
  const targetSection = document.getElementById("search-claim-section");
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
  filterByCategory(category);
}

function filterByStatus(status) {
  activeStatusFilter = status;

  const tabs = document.querySelectorAll(".status-tab");
  tabs.forEach(tab => {
    if (tab.textContent.toLowerCase() === status.toLowerCase() || 
        (status === 'all' && tab.textContent.includes('All'))) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  const heroPills = document.querySelectorAll(".hero-category-capsules .filter-pill");
  heroPills.forEach(pill => {
    if (pill.textContent.toLowerCase().includes(status.toLowerCase()) || 
        (status === 'all' && pill.textContent.includes('All'))) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  renderItemsGrid();
}

function quickFilter(status) {
  const targetSection = document.getElementById("search-claim-section");
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
  filterByStatus(status);
}

function getFilteredItems() {
  return itemsList.filter(item => {
    if (currentSearchQuery) {
      const matchName = item.item_name.toLowerCase().includes(currentSearchQuery);
      const matchCat = item.category.toLowerCase().includes(currentSearchQuery);
      const matchLoc = item.location.toLowerCase().includes(currentSearchQuery);
      const matchDesc = item.description ? item.description.toLowerCase().includes(currentSearchQuery) : false;
      if (!matchName && !matchCat && !matchLoc && !matchDesc) {
        return false;
      }
    }

    if (activeCategoryFilter !== "all") {
      if (item.category.toLowerCase() !== activeCategoryFilter.toLowerCase()) {
        return false;
      }
    }

    if (activeStatusFilter !== "all") {
      if (item.status.toLowerCase() !== activeStatusFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

function renderItemsGrid() {
  const container = document.getElementById("items-grid");
  const emptyState = document.getElementById("empty-state");
  if (!container) return;

  const filtered = getFilteredItems();

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = "";

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    let statusClass = "status-found";
    if (item.status === "Lost") statusClass = "status-lost";
    if (item.status === "Claimed") statusClass = "status-claimed";

    let actionButton = "";
    if (item.status === "Found") {
      actionButton = `
        <button class="btn-primary full-width" onclick="openClaimModal(${item.id})">
          <span>Claim Item</span>
          <span class="btn-arrow">↗</span>
        </button>
      `;
    } else if (item.status === "Claimed") {
      actionButton = `
        <button class="btn-secondary full-width" disabled style="opacity: 0.7; cursor: default;">
          <span>✓ Claimed &amp; Reunited</span>
        </button>
      `;
    } else {
      actionButton = `
        <button class="btn-secondary full-width" onclick="quickFoundReport('${escapeHtml(item.item_name)}')">
          <span>I Found This Item!</span>
          <span class="btn-arrow">↗</span>
        </button>
      `;
    }

    let claimedDetails = "";
    if (item.status === "Claimed" && item.claimed_by) {
      claimedDetails = `
        <div class="claimed-info-box">
          <strong>Verified Claim:</strong>
          ${escapeHtml(item.claimed_by)}
        </div>
      `;
    }

    let photoHtml = "";
    if (item.photo) {
      photoHtml = `
        <div class="item-card-image-wrap">
          <img src="${item.photo}" alt="${escapeHtml(item.item_name)}" />
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="item-card-top">
          <span class="item-id-badge">ITEM #${item.id}</span>
          <span class="status-badge ${statusClass}">
            <span>●</span> ${item.status}
          </span>
        </div>

        ${photoHtml}

        <h3 class="item-title">${escapeHtml(item.item_name)}</h3>
        <span class="item-category-tag">${escapeHtml(item.category)}</span>

        <p class="item-description">${escapeHtml(item.description || 'No additional details provided.')}</p>

        <div class="item-meta-list">
          <div class="meta-row">
            <span class="meta-label">Location:</span>
            <span class="meta-value">${escapeHtml(item.location)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date Logged:</span>
            <span class="meta-value">${escapeHtml(item.date)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Contact / Desk:</span>
            <span class="meta-value">${escapeHtml(item.contact)}</span>
          </div>
        </div>

        ${claimedDetails}
      </div>

      <div class="item-card-actions">
        ${actionButton}
      </div>
    `;

    container.appendChild(card);
  });
}

function openClaimModal(itemId) {
  const item = itemsList.find(i => i.id === itemId);
  if (!item) return;

  if (item.status === "Claimed") {
    showToast(`Item ID ${itemId} has already been claimed.`, "info");
    return;
  }

  const modal = document.getElementById("claim-modal");
  const preview = document.getElementById("modal-item-preview");
  const idInput = document.getElementById("claim-item-id");
  const nameInput = document.getElementById("claim-name");
  const studentIdInput = document.getElementById("claim-student-id");

  const user = usersDb[currentUsername] || usersDb["pranav"];
  idInput.value = item.id;
  nameInput.value = user.name || "Pranav Deshwal";
  studentIdInput.value = user.student_id || "S26CSEU1917";

  let photoSnippet = "";
  if (item.photo) {
    photoSnippet = `<img src="${item.photo}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; margin-right:10px; border:1px solid var(--color-border);" />`;
  }

  preview.innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:8px;">
      ${photoSnippet}
      <div>
        <div style="font-family:var(--font-display); font-size:1.15rem; font-weight:800;">${escapeHtml(item.item_name)}</div>
        <span class="status-badge status-found" style="font-size:0.7rem; padding:2px 8px;">#${item.id} Found</span>
      </div>
    </div>
    <div style="font-size:0.85rem; color:var(--color-muted); line-height:1.4;">
      <div><strong>Category:</strong> ${escapeHtml(item.category)}</div>
      <div><strong>Held At:</strong> ${escapeHtml(item.location)} (${escapeHtml(item.contact)})</div>
      <div><strong>Description:</strong> ${escapeHtml(item.description)}</div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeClaimModal() {
  document.getElementById("claim-modal").style.display = "none";
}

function handleClaimSubmit(event) {
  event.preventDefault();
  const itemId = parseInt(document.getElementById("claim-item-id").value);
  const claimantName = document.getElementById("claim-name").value.trim() || "Pranav Deshwal";
  const studentId = document.getElementById("claim-student-id").value.trim() || "S26CSEU1917";
  const proof = document.getElementById("claim-proof").value.trim() || "Student ID card verification";

  const targetItem = itemsList.find(i => i.id === itemId);
  if (!targetItem) {
    showToast(`No item found with ID ${itemId}.`, "error");
    return;
  }

  if (targetItem.status === "Claimed") {
    showToast(`Item ID ${itemId} has already been claimed.`, "error");
    closeClaimModal();
    return;
  }

  // Update item in accordance with Python claim_item()
  targetItem.status = "Claimed";
  targetItem.claimed_by = `${claimantName} (${studentId}) - Proof: ${proof}`;

  saveDataToStorage();
  closeClaimModal();
  renderItemsGrid();
  renderRecordsTable();
  updateUnclaimedCount();
  updateClaimedStats();

  showToast(`Success: Claim submitted for Item ID ${itemId}! Status updated to Claimed.`, "success");
}

function updateUnclaimedCount() {
  const unclaimed = itemsList.filter(i => i.status === "Found").length;
  const countEl = document.getElementById("unclaimed-count");
  if (countEl) {
    countEl.textContent = `${unclaimed} item${unclaimed === 1 ? '' : 's'}`;
  }
}

// ==============================================================================
// 6. REPORT LOST & FOUND (FROM Management.py, report_found_item.py, lost_item_reporting.py)
// ==============================================================================
function switchReportTab(status) {
  const lostTab = document.getElementById("tab-report-lost");
  const foundTab = document.getElementById("tab-report-found");
  const statusInput = document.getElementById("report-status");
  const submitBtn = document.getElementById("report-submit-btn");

  statusInput.value = status;

  if (status === "Lost") {
    lostTab.classList.add("active");
    foundTab.classList.remove("active");
    submitBtn.innerHTML = `<span>Submit Lost Report</span><span class="btn-arrow">↗</span>`;
  } else {
    foundTab.classList.add("active");
    lostTab.classList.remove("active");
    submitBtn.innerHTML = `<span>Submit Found Report</span><span class="btn-arrow">↗</span>`;
  }

  checkMatchSuggestions();
}

function handleItemReport(event) {
  event.preventDefault();

  const status = document.getElementById("report-status").value;
  const itemName = document.getElementById("form-item-name").value.trim();
  const category = document.getElementById("form-category").value;
  const location = document.getElementById("form-location").value.trim();
  const description = document.getElementById("form-description").value.trim();
  const date = document.getElementById("form-date").value;
  const person = document.getElementById("form-person").value.trim();
  const contact = document.getElementById("form-contact").value.trim();
  const photoData = document.getElementById("form-photo-data")?.value || null;

  // Generate next Item ID
  const nextId = itemsList.length > 0 ? Math.max(...itemsList.map(i => i.id)) + 1 : 1;

  const newItem = {
    id: nextId,
    item_name: itemName,
    category: category,
    description: description,
    location: location,
    date: date,
    reported_by: person,
    contact: contact,
    status: status,
    claimed_by: null,
    photo: photoData
  };

  itemsList.unshift(newItem); // Place latest on top
  saveDataToStorage();

  // Reset form
  resetReportForm();
  dismissMatchAlert();

  // Refresh views
  renderItemsGrid();
  renderRecordsTable();
  updateUnclaimedCount();
  updateClaimedStats();

  showToast(`Item #${nextId} (${itemName}) saved successfully as ${status}!`, "success");

  // Smooth scroll to records or search
  document.getElementById("search-claim-section").scrollIntoView({ behavior: "smooth" });
}

function resetReportForm() {
  document.getElementById("item-report-form").reset();
  removeReportPhoto();
  setupDateDefaults();
  renderCurrentUserUI();
  dismissMatchAlert();
}

function quickFoundReport(itemName) {
  switchReportTab("Found");
  document.getElementById("form-item-name").value = itemName;
  document.getElementById("report-section").scrollIntoView({ behavior: "smooth" });
}

// Smart Match Suggestion Feature (Fulfills the Python comment: Does descriptions matches any lost item)
function checkMatchSuggestions() {
  const currentStatus = document.getElementById("report-status").value;
  const itemName = document.getElementById("form-item-name").value.trim().toLowerCase();
  const category = document.getElementById("form-category").value;
  const alertBox = document.getElementById("match-alert-box");
  const contentBox = document.getElementById("match-alert-content");

  if (!itemName || itemName.length < 3) {
    if (alertBox) alertBox.style.display = "none";
    return;
  }

  // If reporting Found, search Lost records. If reporting Lost, search Found records.
  const targetSearchStatus = currentStatus === "Found" ? "Lost" : "Found";

  const matches = itemsList.filter(item => {
    if (item.status !== targetSearchStatus) return false;
    const matchName = item.item_name.toLowerCase().includes(itemName) || itemName.includes(item.item_name.toLowerCase());
    const matchCat = category && item.category === category;
    return matchName || matchCat;
  });

  if (matches.length > 0 && alertBox && contentBox) {
    const m = matches[0];
    contentBox.innerHTML = `
      <p style="font-size:0.9rem; margin-bottom:8px;">
        There is an existing <strong>${m.status}</strong> item matching your report: 
        <strong>${escapeHtml(m.item_name)}</strong> reported at <em>${escapeHtml(m.location)}</em> (${escapeHtml(m.date)}).
      </p>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn-outline btn-sm" onclick="viewMatchedItem(${m.id})">Inspect Match Details</button>
      </div>
    `;
    alertBox.style.display = "block";
  } else {
    if (alertBox) alertBox.style.display = "none";
  }
}

function dismissMatchAlert() {
  const alertBox = document.getElementById("match-alert-box");
  if (alertBox) alertBox.style.display = "none";
}

function viewMatchedItem(id) {
  const input = document.getElementById("search-input");
  const item = itemsList.find(i => i.id === id);
  if (item && input) {
    input.value = item.item_name;
    handleSearch();
    document.getElementById("search-claim-section").scrollIntoView({ behavior: "smooth" });
  }
}

// ==============================================================================
// 7. ALL CAMPUS RECORDS TABLE (FROM Management.py)
// ==============================================================================
function renderRecordsTable() {
  const tbody = document.getElementById("records-table-body");
  if (!tbody) return;

  const filterQuery = (document.getElementById("table-search-input")?.value || "").toLowerCase();

  const filtered = itemsList.filter(item => {
    if (!filterQuery) return true;
    return (
      item.id.toString().includes(filterQuery) ||
      item.item_name.toLowerCase().includes(filterQuery) ||
      item.category.toLowerCase().includes(filterQuery) ||
      item.location.toLowerCase().includes(filterQuery) ||
      item.status.toLowerCase().includes(filterQuery) ||
      item.reported_by.toLowerCase().includes(filterQuery)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding:32px; color:var(--color-muted);">
          No campus records found matching your query.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");

    let statusBadgeClass = "status-found";
    if (row.status === "Lost") statusBadgeClass = "status-lost";
    if (row.status === "Claimed") statusBadgeClass = "status-claimed";

    let actionBtn = "";
    if (row.status === "Found") {
      actionBtn = `<button class="btn-primary btn-sm" onclick="openClaimModal(${row.id})">Claim</button>`;
    } else if (row.status === "Lost") {
      actionBtn = `<button class="btn-secondary btn-sm" onclick="quickFoundReport('${escapeHtml(row.item_name)}')">Found</button>`;
    } else {
      actionBtn = `<span style="color:#2E7D32; font-weight:700; font-size:0.8rem;">✓ Reunited</span>`;
    }

    let photoCell = "";
    if (row.photo) {
      photoCell = `<img src="${row.photo}" class="table-photo-thumb" alt="${escapeHtml(row.item_name)}" />`;
    } else {
      photoCell = `<div class="table-photo-none">📦</div>`;
    }

    tr.innerHTML = `
      <td><strong>#${row.id}</strong></td>
      <td>${photoCell}</td>
      <td><strong>${escapeHtml(row.item_name)}</strong></td>
      <td><span class="item-category-tag">${escapeHtml(row.category)}</span></td>
      <td style="max-width:240px; font-size:0.82rem; color:var(--color-muted);">${escapeHtml(row.description || '-')}</td>
      <td><span class="status-badge ${statusBadgeClass}">${row.status}</span></td>
      <td>${escapeHtml(row.location)}</td>
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.reported_by)}</td>
      <td>${escapeHtml(row.contact)}</td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function handleTableSearch() {
  renderRecordsTable();
}

function exportRecordsToCSV() {
  const headers = ["Item_ID", "Item_Name", "Category", "Description", "Status", "Location", "Date", "Reported_By", "Contact", "Claimed_By"];
  
  const rows = itemsList.map(item => [
    item.id,
    `"${(item.item_name || '').replace(/"/g, '""')}"`,
    `"${(item.category || '').replace(/"/g, '""')}"`,
    `"${(item.description || '').replace(/"/g, '""')}"`,
    item.status,
    `"${(item.location || '').replace(/"/g, '""')}"`,
    item.date,
    `"${(item.reported_by || '').replace(/"/g, '""')}"`,
    `"${(item.contact || '').replace(/"/g, '""')}"`,
    `"${(item.claimed_by || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `campus_lost_and_found_records_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Campus records exported to CSV!", "success");
}

// ==============================================================================
// 8. UTILITY FUNCTIONS
// ==============================================================================
function handleModalBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    document.getElementById(modalId).style.display = "none";
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === 'success' ? 'toast-success' : (type === 'error' ? 'toast-error' : '')}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initApp);
