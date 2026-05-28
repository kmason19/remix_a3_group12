//sMETAMASK WALLET AND SMART CONTRACT CONNECTION
// Varibles that assist in the interation between and the smart contract

// Stores connection to blockchain through MetaMask
let provider;
// Stores the connected MetaMask wallet signer
let signer;
// Stores the connection to the ParkingSpaceManagement smart contract
let parkingContract;

// Displays the connected wallet address in the navbar/header
const walletAddress = document.getElementById("walletAddress");
// Button used to connect the user's MetaMask wallet
const connectWalletBtn = document.getElementById("connectWalletBtn");
// Displays status messages on the homepage 
const homeStatus = document.getElementById("homestatus");

// Creates the connection between the frontend and the deployed smart contract
async function setupContract() {
  // Connects ether.js to MetaMask
  provider = new ethers.providers.Web3Provider(window.ethereum);
  // Gets the currently selected MetaMask account as the signer
  signer = provider.getSigner();
  // Creates a JavaScript version of the ParkingSpaceManagement Contract 
  // Uses the deployed contract address, ABI, and connected wallet signer
  parkingContract = new ethers.Contract(contractAddress, contractABI, signer);
}
// Requests the user to connect their MetaMask wallet
async function connectWallet() {
  // Checks if MetaMask is installed in the browser
  if (!window.ethereum) {
    homeStatus.textContent = "MetaMask is not installed.";
    return;
  }

  try {
    // Opens MetaMask and asks the user to connect their wallet
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    // Sets up the smart contract connection after wallet connection
    await setupContract();
    // Displays the connected wallet address
    walletAddress.textContent = `Connected: ${accounts[0]}`;
    // Displays a successful wallet connection message
    homeStatus.textContent = "Wallet connected successfully.";
    // Loads and displays available parking spaces on the homepage
    await renderHomeSpaces();

  } catch (error) {
    // Displays an error message if the wallet connection fails
    homeStatus.textContent = "Wallet connection failed.";
    // Prints the full error in the browser console for debugging
    console.error(error);
  }
}
// Checks if MetaMask is already connected when the page loads
async function checkAlreadyConnected() {
  // Stops the function if MetaMask is not installed
  if (!window.ethereum) return;
  // Gets accounts already connected to the website
  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });
  // If an account is already connected, set up the contract and load available spaces
  if (accounts.length > 0) {
    await setupContract();
    // Displays the already connected wallet address
    walletAddress.textContent = `Connected: ${accounts[0]}`;
    // Displays a message that the wallet was already connected
    homeStatus.textContent = "Wallet already connected.";
    // Loads available parking spaces automatically
    await renderHomeSpaces();
  }
}
// Connects the wallet when the connect button is clicked
connectWalletBtn.addEventListener("click", connectWallet);
// Checks for an already connected wallet when the page loads
window.addEventListener("load", checkAlreadyConnected);



// Function to load parking spaces from the smart contract and displays available spaces on the homepage
async function renderHomeSpaces() {
  // Stops the function if the parking contract is not connected yet
  if (!parkingContract) return;
  // Gets the HTML container where parking space cards will be displayed
  const parkingSpacesList = document.getElementById("parkingSpacesList");
  // Clears old parking space cards before loading new ones
  parkingSpacesList.innerHTML = "";
  // Gets the total number of parking spaces created in the smart contract
  const count = await parkingContract.spaceCount();
  // If no parking spaces exist, display this message
  if (count.toNumber() === 0) {
    parkingSpacesList.innerHTML = "<p>No available parking spaces.</p>";
    return;
  }

  
  // Loops through every parking space stored in the smart contract
  for (let i = 1; i <= count.toNumber(); i++) {
    // Gets the details of the current parking space
    const space = await parkingContract.getSpaceDetails(i);

    // Extracts the returned parking space details from the smart contract
    const spaceName = space[0];
    const pricePerHour = space[1];
    const location = space[2];
    const isAvailable = space[3];
    const isDeleted = space[4];

    // Avoids deleted parking spaces shown on homepage
    if (isDeleted)  continue;
    // Avoids unavailable parking spaces shown on homepage
    if (!isAvailable) continue;

    
    // Adds on available parking space card to the homepage
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
