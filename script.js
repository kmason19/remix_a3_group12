// ---------- Spaces storage ----------
let spaces = JSON.parse(localStorage.getItem("spaces")) || [];
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

function saveSpaces() {
  localStorage.setItem("spaces", JSON.stringify(spaces));
}

function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// ---------- Homepage parking cards ----------
function renderHomeSpaces() {
  const parkingSpacesList = document.getElementById("parkingSpacesList");
  if (!parkingSpacesList) return;

  parkingSpacesList.innerHTML = "";

  spaces
    .filter(space => !space.deleted)
    .forEach(function (space) {
    const card = document.createElement("div");
    card.className = "parking-card";

    card.innerHTML = `
      <span class="status ${space.available ? "available" : "booked"}">
        ${space.available ? "Available" : "Booked"}
      </span>
      <h3>${space.name}</h3>
      <h3>Space ID: ${space.id}</h3>
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

// ---------- Provider managed spaces ----------
function renderProviderSpaces() {
  const managedSpacesList = document.getElementById("managedSpacesList");
  if (!managedSpacesList) return;

  managedSpacesList.innerHTML = "";

  spaces.forEach(function (space) {
    const card = document.createElement("div");
    card.className = "managed-space";

    const statusText = space.deleted
        ? "Deleted"
        : space.available
            ? "Available"
            : "Unavailable";

    const statusClass = space.deleted
        ? "deleted"
        : space.available
            ? "available"
            : "booked";
        
    if (space.deleted) {
        card.classList.add("deleted-space");
    }

    card.innerHTML = `
      <h3>Space #${space.id} - ${space.name}</h3>
      <p>Location: ${space.location}</p>
      <p>Price: $${space.price} per hour</p>
      <span class="status ${statusClass}">
        ${statusText}
      </span>
      <br><br>
      <button onclick="fillUpdateForm(${space.id})">Update</button>
      <button onclick="fillDeleteForm(${space.id})" class="cancel-btn">Delete</button>
    `;

    managedSpacesList.appendChild(card);
  });
}

// ---------- Provider create space ----------
const createSpaceBtn = document.getElementById("createSpaceBtn");
const providerStatus = document.getElementById("providerStatus");

if (createSpaceBtn && providerStatus) {
  createSpaceBtn.addEventListener("click", function () {
    const name = document.getElementById("spaceNameInput").value;
    const price = document.getElementById("priceInput").value;
    const location = document.getElementById("locationInput").value;

    if (!name || !price || !location) {
      providerStatus.textContent = "Status: Please fill in all create space fields.";
      return;
    }

    const nextId = spaces.length > 0 ? Math.max(...spaces.map(space => space.id)) + 1 : 1;

    spaces.push({
      id: nextId,
      name: name,
      price: Number(price),
      location: location,
      available: true,
      deleted: false
    });

    saveSpaces();
    renderProviderSpaces();

    providerStatus.textContent = "Status: Parking space created successfully.";

    document.getElementById("spaceNameInput").value = "";
    document.getElementById("priceInput").value = "";
    document.getElementById("locationInput").value = "";
  });
}

// ---------- Fill update/delete forms ----------
window.fillUpdateForm = function (id) {
  const space = spaces.find(space => space.id === id);
  if (!space || !providerStatus) return;

  document.getElementById("updateSpaceIdInput").value = space.id;
  document.getElementById("updateSpaceNameInput").value = space.name;
  document.getElementById("updatePriceInput").value = space.price;
  document.getElementById("updateLocationInput").value = space.location;
  document.getElementById("availabilityInput").value = space.available.toString();

  providerStatus.textContent = "Status: Space loaded into update form.";
};

window.fillDeleteForm = function (id) {
  if (!providerStatus) return;

  document.getElementById("deleteSpaceIdInput").value = id;
  providerStatus.textContent = "Status: Space loaded into delete form.";
};

// ---------- Provider update/delete space ----------
const updateSpaceBtn = document.getElementById("updateSpaceBtn");
const deleteSpaceBtn = document.getElementById("deleteSpaceBtn");

if (updateSpaceBtn && providerStatus) {
  updateSpaceBtn.addEventListener("click", function () {
    const id = Number(document.getElementById("updateSpaceIdInput").value);
    const name = document.getElementById("updateSpaceNameInput").value;
    const price = document.getElementById("updatePriceInput").value;
    const location = document.getElementById("updateLocationInput").value;
    const available = document.getElementById("availabilityInput").value === "true";

    const space = spaces.find(space => space.id === id);

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

if (deleteSpaceBtn && providerStatus) {
  deleteSpaceBtn.addEventListener("click", function () {
    const id = Number(document.getElementById("deleteSpaceIdInput").value);

    const space = spaces.find(space => space.id === id);
    if (!space) {
      providerStatus.textContent = "Status: Space not found.";
      return;
    }
    space.deleted = true;
    space.available = false;


    saveSpaces();
    renderProviderSpaces();

    providerStatus.textContent = "Status: Parking space disabled successfully.";
  });
}

// ---------- Booking dropdown from spaces ----------
function populateBookingSpaces() {
  const selectedSpaceInput = document.getElementById("selectedSpaceInput");
  if (!selectedSpaceInput) return;

  selectedSpaceInput.innerHTML = "";

  spaces
    .filter(space => space.available)
    .forEach(function (space) {
      const option = document.createElement("option");
      option.value = space.id;
      option.dataset.price = space.price;
      option.textContent = `${space.name} - Space ID ${space.id}`;
      selectedSpaceInput.appendChild(option);
    });
}

// ---------- Booking summary ----------
function updateBookingSummary() {
  const selectedSpaceInput = document.getElementById("selectedSpaceInput");
  const spaceIdInput = document.getElementById("spaceIdInput");
  const durationInput = document.getElementById("durationInput");
  const totalAmountInput = document.getElementById("totalAmountInput");

  const summarySpace = document.getElementById("summarySpace");
  const summaryDuration = document.getElementById("summaryDuration");
  const summaryPrice = document.getElementById("summaryPrice");
  const summaryTotal = document.getElementById("summaryTotal");

  if (!selectedSpaceInput || selectedSpaceInput.options.length === 0) return;

  const selectedOption = selectedSpaceInput.options[selectedSpaceInput.selectedIndex];
  const spaceId = Number(selectedOption.value);
  const pricePerHour = Number(selectedOption.dataset.price);
  const duration = Number(durationInput.value);
  const total = pricePerHour * duration;

  spaceIdInput.value = spaceId;
  totalAmountInput.value = "$" + total;

  summarySpace.textContent = selectedOption.textContent;
  summaryDuration.textContent = duration + " hour" + (duration > 1 ? "s" : "");
  summaryPrice.textContent = "$" + pricePerHour;
  summaryTotal.textContent = "$" + total;
}

const selectedSpaceInput = document.getElementById("selectedSpaceInput");
const durationInput = document.getElementById("durationInput");

if (selectedSpaceInput && durationInput) {
  populateBookingSpaces();
  updateBookingSummary();

  selectedSpaceInput.addEventListener("change", updateBookingSummary);
  durationInput.addEventListener("change", updateBookingSummary);
}

// ---------- Recent bookings ----------
function renderRecentBookings() {
  const recentBookingsList = document.getElementById("recentBookingsList");
  if (!recentBookingsList) return;

  recentBookingsList.innerHTML = "";

  bookings.forEach(function (booking) {
    const card = document.createElement("div");
    card.className = "recent-booking";

    card.innerHTML = `
      <h3>Booking #${booking.id}</h3>
      <p>Space: ${booking.space}</p>
      <p>Duration: ${booking.duration} hour${booking.duration > 1 ? "s" : ""}</p>
      <p>Total: $${booking.total}</p>
      <span class="status ${booking.status === "Confirmed" ? "available" : "booked"}">
        ${booking.status}
      </span>
    `;

    recentBookingsList.appendChild(card);
  });
}

// ---------- Create booking ----------
const createBookingBtn = document.getElementById("createBookingBtn");
const transactionStatus = document.getElementById("transactionStatus");

if (createBookingBtn && transactionStatus) {
  createBookingBtn.addEventListener("click", function () {
    const selectedSpaceInput = document.getElementById("selectedSpaceInput");
    const durationInput = document.getElementById("durationInput");
    const totalAmountInput = document.getElementById("totalAmountInput");

    if (!selectedSpaceInput || selectedSpaceInput.options.length === 0) {
      transactionStatus.textContent = "Status: No available parking spaces to book.";
      return;
    }

    const selectedOption = selectedSpaceInput.options[selectedSpaceInput.selectedIndex];
    const spaceId = Number(selectedOption.value);
    const duration = Number(durationInput.value);
    const total = totalAmountInput.value.replace("$", "");

    const newBooking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(booking => booking.id)) + 1 : 1,
      spaceId: spaceId,
      space: selectedOption.textContent,
      duration: duration,
      total: total,
      status: "Confirmed"
    };

    bookings.push(newBooking);
    saveBookings();
    renderRecentBookings();

    const space = spaces.find(space => space.id === spaceId);
    if (space) {
      space.available = false;
    }

    saveBookings();
    saveSpaces();

    renderRecentBookings();
    populateBookingSpaces();
    updateBookingSummary();

    transactionStatus.textContent = "Status: Booking submitted successfully.";
  });
}

// ---------- Manage booking ----------
const cancelBookingBtn = document.getElementById("cancelBookingBtn");
const completeBookingBtn = document.getElementById("completeBookingBtn");

if (cancelBookingBtn && transactionStatus) {
  cancelBookingBtn.addEventListener("click", function () {
    const bookingId = Number(document.getElementById("bookingIdInput").value);
    const booking = bookings.find(booking => booking.id === bookingId);

    if (!booking) {
      transactionStatus.textContent = "Status: Booking not found.";
      return;
    }

    booking.status = "Cancelled";

    const space = spaces.find(space => space.id === booking.spaceId);
    if (space) {
      space.available = true;
    }

    saveBookings();
    saveSpaces();
    renderRecentBookings();

    transactionStatus.textContent = "Status: Booking cancelled successfully.";
  });
}

if (completeBookingBtn && transactionStatus) {
  completeBookingBtn.addEventListener("click", function () {
    const bookingId = Number(document.getElementById("bookingIdInput").value);
    const booking = bookings.find(booking => booking.id === bookingId);

    if (!booking) {
      transactionStatus.textContent = "Status: Booking not found.";
      return;
    }

    booking.status = "Completed";

    const space = spaces.find(space => space.id === booking.spaceId);
    if (space) {
      space.available = true;
    }

    saveBookings();
    saveSpaces();
    renderRecentBookings();

    transactionStatus.textContent = "Status: Booking completed successfully.";
  });
}

// ---------- Run render functions ----------
renderHomeSpaces();
renderProviderSpaces();
renderRecentBookings();
