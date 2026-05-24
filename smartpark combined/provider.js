let provider;
let signer;
let parkingContract;

const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const providerStatus = document.getElementById("providerStatus");

async function setupContract() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  parkingContract = new ethers.Contract(contractAddress, contractABI, signer);
}

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

  } catch (error) {
    providerStatus.textContent = "Wallet connection failed.";
    console.error(error);
  }
}

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
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
window.addEventListener("load", checkAlreadyConnected);

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

  } catch (error) {
    providerStatus.textContent = "Failed to update parking space.";
    console.error(error);
  }
});

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

  } catch (error) {
    providerStatus.textContent = "Failed to delete parking space.";
    console.error(error);
  }
});

async function loadManagedSpaces() {
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

    const deletedClass = isDeleted ? "deleted-space" : "";


    list.innerHTML += `
    <div class="space-card ${deletedClass}">
        <h3>${spaceName}</h3>

        <p><strong>Space ID:</strong> ${i}</p>
        <p><strong>Price:</strong> $${pricePerHour.toString()}/hour</p>
        <p><strong>Location:</strong> ${location}</p>

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

function fillUpdateForm(id, name, price, location, available) {
  document.getElementById("updateSpaceIdInput").value = id;
  document.getElementById("updateSpaceNameInput").value = name;
  document.getElementById("updatePriceInput").value = price;
  document.getElementById("updateLocationInput").value = location;
  document.getElementById("availabilityInput").value = available ? "true" : "false";

  providerStatus.textContent = `Space ID ${id} loaded into update form.`;
}

function fillDeleteForm(id) {
  document.getElementById("deleteSpaceIdInput").value = id;
  providerStatus.textContent = `Space ID ${id} loaded into delete form.`;
}