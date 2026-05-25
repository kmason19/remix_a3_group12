// METAMASK WALLET AND CONTRACT SETUP
// Stores the blockchain provider connection from MetaMask
let provider;

// Stores the selected MetaMask wallet signer
let signer;

// Stores the ParkingSpaceManagement smart contract connection
let parkingContract;

// Stores the BookingAndPayment smart contract connection
let bookingContract;

// Stores the connected wallet address so bookings can be filtered by user
let connectedAccount;

// Stores the selected parking space price so the total can be calculated
let selectedPricePerHour = 0;



// HTML ELEMENT REFERENCES
const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const transactionStatus = document.getElementById("transactionStatus");

const selectedSpaceInput = document.getElementById("selectedSpaceInput");
const spaceIdInput = document.getElementById("spaceIdInput");
const durationInput = document.getElementById("durationInput");
const totalAmountInput = document.getElementById("totalAmountInput");

const summarySpace = document.getElementById("summarySpace");
const summaryDuration = document.getElementById("summaryDuration");
const summaryPrice = document.getElementById("summaryPrice");
const summaryTotal = document.getElementById("summaryTotal");



// SETUP SMART CONTRACT CONNECTIONS
async function setupContracts() {
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



// CONNECT WALLET
async function connectWallet() {
  if (!window.ethereum) {
    transactionStatus.textContent = "MetaMask is not installed.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    connectedAccount = accounts[0];

    await setupContracts();

    walletAddress.textContent = `Connected: ${connectedAccount}`;
    transactionStatus.textContent = "Wallet connected successfully.";

    await loadSelectedSpace();
    await loadRecentBookings();

  } catch (error) {
    transactionStatus.textContent = "Wallet connection failed.";
    console.error(error);
  }
}



// CHECK IF WALLET IS ALREADY CONNECTED
async function checkAlreadyConnected() {
  if (!window.ethereum) return;

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length > 0) {
    connectedAccount = accounts[0];

    await setupContracts();

    walletAddress.textContent = `Connected: ${connectedAccount}`;
    transactionStatus.textContent = "Wallet already connected.";

    await loadSelectedSpace();
    await loadRecentBookings();
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
window.addEventListener("load", checkAlreadyConnected);



// LOAD SELECTED PARKING SPACE
async function loadSelectedSpace() {
  if (!parkingContract) return;

  const urlParams = new URLSearchParams(window.location.search);
  const spaceId = urlParams.get("spaceId");

  if (!spaceId) {
    transactionStatus.textContent = "Please select a parking space from the homepage.";
    return;
  }

  try {
    const space = await parkingContract.getSpaceDetails(spaceId);

    const spaceName = space[0];
    const pricePerHour = space[1];
    const location = space[2];
    const isAvailable = space[3];
    const isDeleted = space[4];

    if (isDeleted || !isAvailable) {
      transactionStatus.textContent = "This parking space is not available for booking.";
      return;
    }

    selectedPricePerHour = pricePerHour;

    selectedSpaceInput.value = `${spaceName} - ${location}`;
    spaceIdInput.value = spaceId;

    updateBookingSummary();

  } catch (error) {
    transactionStatus.textContent = "Failed to load selected parking space.";
    console.error(error);
  }
}



// UPDATE BOOKING SUMMARY
function updateBookingSummary() {
  if (!spaceIdInput.value || !selectedPricePerHour) return;

  const duration = Number(durationInput.value);
  const total = selectedPricePerHour.mul(duration);

  totalAmountInput.value = `${ethers.utils.formatEther(total)} ETH`;
  summarySpace.textContent = selectedSpaceInput.value;
  summaryDuration.textContent = `${duration} hour${duration > 1 ? "s" : ""}`;
  summaryPrice.textContent = `${ethers.utils.formatEther(selectedPricePerHour)} ETH`;
  summaryTotal.textContent = `${ethers.utils.formatEther(total)} ETH`;
}

durationInput.addEventListener("change", updateBookingSummary);



// CREATE BOOKING AND PAY
document.getElementById("createBookingBtn").addEventListener("click", async () => {
  if (!bookingContract) {
    transactionStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const spaceId = spaceIdInput.value;
  const duration = durationInput.value;

  if (!spaceId || !duration) {
    transactionStatus.textContent = "Please select a space and duration.";
    return;
  }

  try {
    const totalAmount = selectedPricePerHour.mul(duration);

    transactionStatus.textContent = "Creating booking... Please confirm in MetaMask.";

    const tx = await bookingContract.createBooking(spaceId, duration, {
      value: totalAmount
    });

    transactionStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    transactionStatus.textContent = "Booking created successfully.";

    await loadSelectedSpace();
    await loadRecentBookings();

  } catch (error) {
    transactionStatus.textContent = "Failed to create booking.";
    console.error(error);
  }
});



// CANCEL BOOKING
document.getElementById("cancelBookingBtn").addEventListener("click", async () => {
  if (!bookingContract) {
    transactionStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const bookingId = document.getElementById("bookingIdInput").value;

  if (!bookingId) {
    transactionStatus.textContent = "Please enter a booking ID.";
    return;
  }

  try {
    transactionStatus.textContent = "Cancelling booking... Please confirm in MetaMask.";

    const tx = await bookingContract.cancelBooking(bookingId);

    transactionStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    transactionStatus.textContent = "Booking cancelled successfully.";

    await loadRecentBookings();

  } catch (error) {
    transactionStatus.textContent = "Failed to cancel booking.";
    console.error(error);
  }
});


// COMPLETE BOOKING
document.getElementById("completeBookingBtn").addEventListener("click", async () => {
  if (!bookingContract) {
    transactionStatus.textContent = "Please connect your wallet first.";
    return;
  }

  const bookingId = document.getElementById("bookingIdInput").value;

  if (!bookingId) {
    transactionStatus.textContent = "Please enter a booking ID.";
    return;
  }

  try {
    transactionStatus.textContent = "Completing booking... Please confirm in MetaMask.";

    const tx = await bookingContract.completeBooking(bookingId);

    transactionStatus.textContent = "Transaction submitted. Waiting for confirmation...";

    await tx.wait();

    transactionStatus.textContent = "Booking completed successfully.";

    await loadRecentBookings();

  } catch (error) {
    transactionStatus.textContent = "Failed to complete booking.";
    console.error(error);
  }
});



// LOAD RECENT BOOKINGS AND YOUR BOOKINGS
async function loadRecentBookings() {
  if (!bookingContract) return;

  const recentList = document.getElementById("recentBookingsList");
  const yourList = document.getElementById("yourBookingsList");

  recentList.innerHTML = "";
  yourList.innerHTML = "";

  const count = await bookingContract.bookingCount();

  if (count.toNumber() === 0) {
    recentList.innerHTML = "<p>No bookings created yet.</p>";
    yourList.innerHTML = "<p>No bookings found for this wallet.</p>";
    return;
  }

  let hasYourBookings = false;

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

    // Recent Bookings shows a simpler public booking summary
    recentList.innerHTML += `
      <div class="recent-booking">
        <h3>Booking #${bookingId.toString()}</h3>
        <p><strong>Space ID:</strong> ${spaceId.toString()}</p>
        <p><strong>User:</strong> ${user}</p>
        <p><strong>Duration:</strong> ${durationHours.toString()} hour${durationHours.toNumber() > 1 ? "s" : ""}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Booked At:</strong> ${formattedTime}</p>
      </div>
    `;

    // Your Bookings only shows bookings created by the connected wallet
    if (
      connectedAccount &&
      user.toLowerCase() === connectedAccount.toLowerCase()
    ) {
      hasYourBookings = true;

      yourList.innerHTML += `
        <div class="recent-booking">
          <h3>Booking #${bookingId.toString()}</h3>
          <p><strong>Space ID:</strong> ${spaceId.toString()}</p>
          <p><strong>User:</strong> ${user}</p>
          <p><strong>Duration:</strong> ${durationHours.toString()} hour${durationHours.toNumber() > 1 ? "s" : ""}</p>
          <p><strong>Total:</strong> ${ethers.utils.formatEther(totalAmount)} ETH</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Booked At:</strong> ${formattedTime}</p>
        </div>
      `;
    }
  } 

  if (!hasYourBookings) {
    yourList.innerHTML = "<p>No bookings found for this wallet.</p>";
  }
}