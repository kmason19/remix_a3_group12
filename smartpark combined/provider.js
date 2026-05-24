//METAMASK WALLET AND SMART CONTRACT CONNECTION
// Varibles that assist in the interation between and the smart contract
//store connection to blockchain network
let provider;
//stores current connected wallet account
let signer;
let parkingContract;

//references to HTML elements used throughout the page
const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const providerStatus = document.getElementById("providerStatus");

//creates connection between the frontend and delopyed contract
async function setupContract() {
  //create connection between ether.js and metamask
  provider = new ethers.providers.Web3Provider(window.ethereum);
  //get wallet account selected in metamask
  signer = provider.getSigner();
  parkingContract = new ethers.Contract(contractAddress, contractABI, signer);
}

//connects metamask wallet to application
async function connectWallet() {
  //Checks metamask is installed 
  if (!window.ethereum) {
    //Message displaying metamask cannot be found
    providerStatus.textContent = "MetaMask is not installed.";
    //stop code from running
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    await setupContract();

    //Message displaying wallet is connected with the name of the connected address
    walletAddress.textContent = `Connected: ${accounts[0]}`;
    //Message displaying wallet connection was a success
    providerStatus.textContent = "Wallet connected successfully.";

    await loadManagedSpaces();

  } 

  //catches errors during connection
  catch (error) {
    //displays error message that wallect connection failed
    providerStatus.textContent = "Wallet connection failed.";
    console.error(error);
  }
}


//Checks if metamask is already connected when page loads
async function checkAlreadyConnected() {
  if (!window.ethereum) return;

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length > 0) {
    await setupContract();
    //Message displaying wallet is connected with the name of the connected address
    walletAddress.textContent = `Connected: ${accounts[0]}`;
    //Message displaying wallet connection was a success
    providerStatus.textContent = "Wallet already connected.";

    await loadManagedSpaces();
  }
}

//Event listener for the connect wallet button on webpage
connectWalletBtn.addEventListener("click", connectWallet);
//checks for exisitng wallet connection when page loads
window.addEventListener("load", checkAlreadyConnected);





//CREATE PARKING SPACE FUNCTIONALITY

//handles new parking space creation through ParkManagement smart contract
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