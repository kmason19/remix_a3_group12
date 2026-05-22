const durationInput = document.getElementById("durationInput");
const totalAmountInput = document.getElementById("totalAmountInput");
const summaryDuration = document.getElementById("summaryDuration");
const summaryTotal = document.getElementById("summaryTotal");

if (durationInput && totalAmountInput && summaryDuration && summaryTotal) {
  const pricePerHour = 10;

  function calculateTotal() {
    const duration = Number(durationInput.value);
    const total = pricePerHour * duration;

    totalAmountInput.value = "$" + total;
    summaryDuration.textContent = duration + " hour" + (duration > 1 ? "s" : "");
    summaryTotal.textContent = "$" + total;
  }

  durationInput.addEventListener("change", calculateTotal);
  calculateTotal();
}

// Get existing spaces from browser storage, or start empty
let spaces = JSON.parse(localStorage.getItem("spaces")) || [];

// Save spaces to browser storage
function saveSpaces() {
  localStorage.setItem("spaces", JSON.stringify(spaces));
}

// Create a parking card for the homepage
function renderHomeSpaces() {
  const parkingSpacesList = document.getElementById("parkingSpacesList");

  if (!parkingSpacesList) return;

  parkingSpacesList.innerHTML = "";

  spaces.forEach(function (space) {
    const card = document.createElement("div");
    card.className = "parking-card";

    card.innerHTML = `
      <span class="status ${space.available ? "available" : "booked"}">
        ${space.available ? "Available" : "Booked"}
      </span>

      <h3>${space.name}</h3>
      <p>Location: ${space.location}</p>
      <p>Price: $${space.price} per hour</p>

      ${
        space.available
          ? `<a href="booking.html" class="button-link">Book Space</a>`
          : `<button class="disabled-btn" disabled>Unavailable</button>`
      }
    `;

    parkingSpacesList.appendChild(card);
  });
}

// Create managed cards for provider page
function renderProviderSpaces() {
  const managedSpacesList = document.getElementById("managedSpacesList");

  if (!managedSpacesList) return;

  managedSpacesList.innerHTML = "";

  spaces.forEach(function (space) {
    const card = document.createElement("div");
    card.className = "managed-space";
    card.id = "space-" + space.id;

    card.innerHTML = `
      <h3>Space #${space.id} - ${space.name}</h3>
      <p>Location: ${space.location}</p>
      <p>Price: $${space.price} per hour</p>

      <span class="status ${space.available ? "available" : "booked"}">
        ${space.available ? "Available" : "Unavailable"}
      </span>

      <br><br>

      <button onclick="fillUpdateForm(${space.id})">Update</button>
      <button onclick="fillDeleteForm(${space.id})" class="cancel-btn">Delete</button>
    `;

    managedSpacesList.appendChild(card);
  });
}

// Create new space from provider form
const createSpaceBtn = document.getElementById("createSpaceBtn");
const providerStatus = document.getElementById("providerStatus");

if (createSpaceBtn) {
  createSpaceBtn.addEventListener("click", function () {
    const name = document.getElementById("spaceNameInput").value;
    const price = document.getElementById("priceInput").value;
    const location = document.getElementById("locationInput").value;

    if (!name || !price || !location) {
      providerStatus.textContent = "Status: Please fill in all create space fields.";
      return;
    }

    const newSpace = {
      id: spaces.length + 1,
      name: name,
      price: Number(price),
      location: location,
      available: true
    };

    spaces.push(newSpace);
    saveSpaces();
    renderProviderSpaces();

    providerStatus.textContent = "Status: Parking space created successfully.";

    document.getElementById("spaceNameInput").value = "";
    document.getElementById("priceInput").value = "";
    document.getElementById("locationInput").value = "";
  });
}

// Fill update form
window.fillUpdateForm = function (id) {
  const space = spaces.find(function (item) {
    return item.id === id;
  });

  if (!space) return;

  document.getElementById("updateSpaceIdInput").value = space.id;
  document.getElementById("updateSpaceNameInput").value = space.name;
  document.getElementById("updatePriceInput").value = space.price;
  document.getElementById("updateLocationInput").value = space.location;
  document.getElementById("availabilityInput").value = space.available.toString();

  providerStatus.textContent = "Status: Space loaded into update form.";
};

// Fill delete form
window.fillDeleteForm = function (id) {
  document.getElementById("deleteSpaceIdInput").value = id;
  providerStatus.textContent = "Status: Space loaded into delete form.";
};

// Update existing space
const updateSpaceBtn = document.getElementById("updateSpaceBtn");

if (updateSpaceBtn) {
  updateSpaceBtn.addEventListener("click", function () {
    const id = Number(document.getElementById("updateSpaceIdInput").value);
    const name = document.getElementById("updateSpaceNameInput").value;
    const price = document.getElementById("updatePriceInput").value;
    const location = document.getElementById("updateLocationInput").value;
    const available = document.getElementById("availabilityInput").value === "true";

    const space = spaces.find(function (item) {
      return item.id === id;
    });

    if (!space) {
      providerStatus.textContent = "Status: Space not found.";
      return;
    }

    space.name = name;
    space.price = Number(price);
    space.location = location;
    space.available = available;

    saveSpaces();
    renderProviderSpaces();

    providerStatus.textContent = "Status: Parking space updated successfully.";
  });
}

// Delete existing space
const deleteSpaceBtn = document.getElementById("deleteSpaceBtn");

if (deleteSpaceBtn) {
  deleteSpaceBtn.addEventListener("click", function () {
    const id = Number(document.getElementById("deleteSpaceIdInput").value);

    spaces = spaces.filter(function (space) {
      return space.id !== id;
    });

    saveSpaces();
    renderProviderSpaces();

    providerStatus.textContent = "Status: Parking space deleted successfully.";
  });
}

// Run page rendering
renderHomeSpaces();
renderProviderSpaces();

const createBookingBtn = document.getElementById("createBookingBtn");
const transactionStatus = document.getElementById("transactionStatus");
const cancelBookingBtn = document.getElementById("cancelBookingBtn");
const completeBookingBtn = document.getElementById("completeBookingBtn");

if (createBookingBtn && transactionStatus) {
  createBookingBtn.addEventListener("click", function () {
    transactionStatus.textContent = "Status: Booking submitted successfully.";
  });
}

if (cancelBookingBtn && transactionStatus) {
  cancelBookingBtn.addEventListener("click", function () {
    transactionStatus.textContent = "Status: Booking cancelled successfully.";
  });
}

if (completeBookingBtn && transactionStatus) {
  completeBookingBtn.addEventListener("click", function () {
    transactionStatus.textContent = "Status: Booking completed successfully.";
  });
}
