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
