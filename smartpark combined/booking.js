let provider;
let signer;
let parkingContract;
let bookingContract;

const walletAddress = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const transactionStatus = document.getElementById("transactionStatus");

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

async function connectWallet() {
  if (!window.ethereum) {
    transactionStatus.textContent = "MetaMask is not installed.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    await setupContracts();

    walletAddress.textContent = `Connected: ${accounts[0]}`;
    transactionStatus.textContent = "Wallet connected successfully.";

  } catch (error) {
    transactionStatus.textContent = "Wallet connection failed.";
    console.error(error);
  }
}

async function checkAlreadyConnected() {
  if (!window.ethereum) return;

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length > 0) {
    await setupContracts();

    walletAddress.textContent = `Connected: ${accounts[0]}`;
    transactionStatus.textContent = "Wallet already connected.";
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
window.addEventListener("load", checkAlreadyConnected);