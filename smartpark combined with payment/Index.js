//METAMASK WALLET AND SMART CONTRACT CONNECTION
// Varibles that assist in the interation between and the smart contract
//store connection to blockchain network
let provider;
let signer;
let parkingContract;

const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const homeStatus = document.getElementById("homestatus");

async function setupContract() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  parkingContract = new ethers.Contract(contractAddress, contractABI, signer);
}

async function connectWallet() {
  if (!window.ethereum) {
    homeStatus.textContent = "MetaMask is not installed.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    await setupContract();

    walletAddress.textContent = `Connected: ${accounts[0]}`;
    homeStatus.textContent = "Wallet connected successfully.";

    await renderHomeSpaces();

  } catch (error) {
    homeStatus.textContent = "Wallet connection failed.";
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
    homeStatus.textContent = "Wallet already connected.";

    await renderHomeSpaces();
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
window.addEventListener("load", checkAlreadyConnected);



//function to display available parking spaces
async function renderHomeSpaces() {
  if (!parkingContract) return;

  const parkingSpacesList = document.getElementById("parkingSpacesList");
  parkingSpacesList.innerHTML = "";

  const count = await parkingContract.spaceCount();

  if (count.toNumber() === 0) {
    parkingSpacesList.innerHTML = "<p>No available parking spaces.</p>";
    return;
  }

  

  for (let i = 1; i <= count.toNumber(); i++) {
    const space = await parkingContract.getSpaceDetails(i);

    const spaceName = space[0];
    const pricePerHour = space[1];
    const location = space[2];
    const isAvailable = space[3];
    const isDeleted = space[4];

    //Avoids showing deleted parks
    if (isDeleted)  continue;
    //Avoids showing unavailable parks
    if (!isAvailable) continue;

    

    parkingSpacesList.innerHTML += `
      <div class="parking-card">
        <span class="status ${isAvailable ? "available" : "booked"}">
          ${isAvailable ? "Available" : "Unavailable"}
        </span>

        <h3>${spaceName}</h3>
        <p><strong>Space ID: </strong> ${i}</p>

        <p><strong>Price:</strong> ${ethers.utils.formatEther(pricePerHour)} ETH/hour</p>
        <p><strong>Location:</strong> ${location}</p>

        ${
          isAvailable
            ? `<a href="booking.html?spaceId=${i}" class="button-link">Book Space</a>`
            : `<button class="disabled-btn" disabled>Unavailable</button>`
        }
      </div>
    `;

    
  }

 

}