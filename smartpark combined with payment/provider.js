// METAMASK WALLET AND SMART CONTRACT CONNECTION

let provider;
let signer;
let parkingContract;
let bookingContract;

// HTML elements
const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const providerStatus = document.getElementById("providerStatus");

// Connect frontend to both deployed smart contracts
async function setupContract() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  parkingContract = new ethers.Contract(
    parkingContractAddress,
    parkingContractABI,
    signer
  );

  bookingContract = new ethers.Contract(
    bookingContractAddress,
    bookingContractABI,
    signer
  );
}

// Connect MetaMask wallet
async function connectWallet() {
  if (!window.ethereum) {
    providerStatus.textContent = "MetaMask is not installed.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    await setupContract();

    walletAddress.textContent = `Connected: ${accounts[0]}`;
    providerStatus.textContent = "Wallet connected successfully.";

    await loadManagedSpaces();
    await loadProviderBookings();
    await loadPaymentMessage();

  } catch (error) {
    providerStatus.textContent = "Wallet connection failed.";
    console.error(error);
  }
}

// Check if wallet is already connected
async function checkAlreadyConnected() {
  if (!window.ethereum) return;

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length > 0) {
    await setupContract();

    walletAddress.textContent = `Connected: ${accounts[0]}`;
    providerStatus.textContent = "Wallet already connected.";

    await loadManagedSpaces();
    await loadProviderBookings();
    await loadPaymentMessage();
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
window.addEventListener("load", checkAlreadyConnected);


//WITHDRAW COMPLETE BOOKING PAYMENTS

//listens for load payment button
document.getElementById("loadPaymentAmountBtn").addEventListener("click", async () => {
  await loadPaymentInfo();
});

//WITHDRAW PAYMENTS TO PROVIDER ACCOUNT
document.getElementById("withdrawPaymentBtn").addEventListener("click", async () => {
  if (!bookingContract) {
    providerStatus.textContent = "Please connect your wallet first";
    return;
  }

  try {
    providerStatus.textContent = "Withdrawing payments... Please confirm in MetaMask";

    const tx = await bookingContract.paymentsWithdraw();

    providerStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    providerStatus.textContent = "Payments withdrawn successfully.";

    await loadPaymentInfo();
    await loadProviderBookings();

  } catch (error) {
    providerStatus.textContent = "Failed to withdraw payments.";
    console.error(error);
  }
});






//VIEW PAYMENT AMOUNTS THAT REQUIRE WITHDRAWAL
async function loadPaymentMessage() {
  if (!bookingContract) return;

  const contractBalance = await bookingContract.getContractBalance();

  document.getElementById("loadPaymentMessage").textContent =
    ethers.utils.formatEther(contractBalance) + " ETH";


}





// CREATE PARKING SPACE
document.getElementById("createSpaceBtn").addEventListener("click", async () => {
  if (!parkingContract) {
    providerStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const spaceName = document.getElementById("spaceNameInput").value;
  const price = document.getElementById("priceInput").value;
  const location = document.getElementById("locationInput").value;

  if (!spaceName || !price || !location) {
    providerStatus.textContent = "Please fill in all create space fields.";
    return;
  }

  try {
    providerStatus.textContent = "Creating parking space... Please confirm in MetaMask.";

    const tx = await parkingContract.createSpace(spaceName, price, location);

    providerStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    providerStatus.textContent = "Parking space created successfully.";

    document.getElementById("spaceNameInput").value = "";
    document.getElementById("priceInput").value = "";
    document.getElementById("locationInput").value = "";

    await loadManagedSpaces();

  } catch (error) {
    providerStatus.textContent = "Failed to create parking space.";
    console.error(error);
  }
});


// UPDATE PARKING SPACE
document.getElementById("updateSpaceBtn").addEventListener("click", async () => {
  if (!parkingContract) {
    providerStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const spaceId = document.getElementById("updateSpaceIdInput").value;
  const spaceName = document.getElementById("updateSpaceNameInput").value;
  const price = document.getElementById("updatePriceInput").value;
  const location = document.getElementById("updateLocationInput").value;
  const isAvailable = document.getElementById("availabilityInput").value === "true";

  if (!spaceId || !spaceName || !price || !location) {
    providerStatus.textContent = "Please fill in all update space fields.";
    return;
  }

  try {
    providerStatus.textContent = "Updating parking space... Please confirm in MetaMask.";

    const tx = await parkingContract.updateSpace(
      spaceId,
      spaceName,
      price,
      location,
      isAvailable
    );

    providerStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    providerStatus.textContent = "Parking space updated successfully.";

    await loadManagedSpaces();
    await loadProviderBookings();

  } catch (error) {
    providerStatus.textContent = "Failed to update parking space.";
    console.error(error);
  }
});


// DELETE PARKING SPACE
document.getElementById("deleteSpaceBtn").addEventListener("click", async () => {
  if (!parkingContract) {
    providerStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const spaceId = document.getElementById("deleteSpaceIdInput").value;

  if (!spaceId) {
    providerStatus.textContent = "Please enter a space ID to delete.";
    return;
  }

  try {
    providerStatus.textContent = "Deleting parking space... Please confirm in MetaMask.";

    const tx = await parkingContract.deleteSpace(spaceId);

    providerStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    providerStatus.textContent = "Parking space deleted successfully.";

    document.getElementById("deleteSpaceIdInput").value = "";

    await loadManagedSpaces();
    await loadProviderBookings();

  } catch (error) {
    providerStatus.textContent = "Failed to delete parking space.";
    console.error(error);
  }
});


// LOAD MANAGED PARKING SPACES
async function loadManagedSpaces() {
  if (!parkingContract) return;

  const list = document.getElementById("managedSpacesList");
  list.innerHTML = "";

  const count = await parkingContract.spaceCount();

  if (count.toNumber() === 0) {
    list.innerHTML = "<p>No parking spaces created yet.</p>";
    return;
  }

  for (let i = 1; i <= count.toNumber(); i++) {
    const space = await parkingContract.getSpaceDetails(i);

    const spaceName = space[0];
    const pricePerHour = space[1];
    const location = space[2];
    const isAvailable = space[3];
    const isDeleted = space[4];
    const timestamp = space[5];

    const deletedClass = isDeleted ? "deleted-space" : "";

    const formattedTime = new Date(
      Number(timestamp.toString()) * 1000
    ).toLocaleString();

    list.innerHTML += `
      <div class="space-card ${deletedClass}">
        <h3>${spaceName}</h3>

        <p><strong>Space ID:</strong> ${i}</p>
        <p><strong>Price:</strong> $${pricePerHour.toString()}/hour</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Created At:</strong> ${formattedTime}</p>

        <p>
          <strong>Status:</strong>
          ${isDeleted ? "Deleted" : (isAvailable ? "Available" : "Unavailable")}
        </p>

        <button
          ${isDeleted ? "disabled" : ""}
          onclick="fillUpdateForm(${i}, '${spaceName}', '${pricePerHour}', '${location}', ${isAvailable})">
          Update Space
        </button>

        <button
          ${isDeleted ? "disabled" : ""}
          onclick="fillDeleteForm(${i})"
          class="cancel-btn">
          Delete Space
        </button>
      </div>
    `;
  }
}


// LOAD ALL BOOKINGS FOR PROVIDER
async function loadProviderBookings() {
  if (!bookingContract || !parkingContract) return;

  const list = document.getElementById("providerBookingsList");
  list.innerHTML = "";

  const count = await bookingContract.bookingCount();

  if (count.toNumber() === 0) {
    list.innerHTML = "<p>No bookings created yet.</p>";
    return;
  }

  for (let i = 1; i <= count.toNumber(); i++) {
    const booking = await bookingContract.getBookingDetails(i);

    const bookingId = booking[0];
    const spaceId = booking[1];
    const user = booking[2];
    const durationHours = booking[3];
    const totalAmount = booking[4];
    const isPaid = booking[5];
    const isCancelled = booking[6];
    const isCompleted = booking[7];
    const timestamp = booking[8];

    const space = await parkingContract.getSpaceDetails(spaceId);
    const spaceName = space[0];
    const pricePerHour = space[1];
    const location = space[2];

    let status = "Confirmed";

    if (isCancelled) {
      status = "Cancelled";
    } else if (isCompleted) {
      status = "Completed";
    } else if (isPaid) {
      status = "Paid";
    }

    const formattedTime = new Date(
      Number(timestamp.toString()) * 1000
    ).toLocaleString();

    list.innerHTML += `
      <div class="recent-booking">
        <h3>Booking #${bookingId.toString()}</h3>

        <p><strong>Space ID:</strong> ${spaceId.toString()}</p>
        <p><strong>Space Name:</strong> ${spaceName}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>User:</strong> ${user}</p>
        <p><strong>Price Per Hour:</strong> $${pricePerHour.toString()}</p>
        <p><strong>Duration:</strong> ${durationHours.toString()} hour${durationHours.toNumber() > 1 ? "s" : ""}</p>
        <p><strong>Total Amount:</strong> $${totalAmount.toString()}</p>
        <p><strong>Payment Status:</strong> ${isPaid ? "Paid" : "Not Paid"}</p>
        <p><strong>Booking Status:</strong> ${status}</p>
        <p><strong>Booked At:</strong> ${formattedTime}</p>
      </div>
    `;
  }
}


// FILL UPDATE FORM FROM CARD BUTTON
function fillUpdateForm(id, name, price, location, available) {
  document.getElementById("updateSpaceIdInput").value = id;
  document.getElementById("updateSpaceNameInput").value = name;
  document.getElementById("updatePriceInput").value = price;
  document.getElementById("updateLocationInput").value = location;
  document.getElementById("availabilityInput").value = available ? "true" : "false";

  providerStatus.textContent = `Space ID ${id} loaded into update form.`;
}


// FILL DELETE FORM FROM CARD BUTTON
function fillDeleteForm(id) {
  document.getElementById("deleteSpaceIdInput").value = id;
  providerStatus.textContent = `Space ID ${id} loaded into delete form.`;
}