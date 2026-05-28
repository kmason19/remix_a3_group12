# SmartPark Application 

## Project Overview
SmartPark is a blockchain-based parking management system designed for hotel environments. The application allows parking space providers to manage parking spaces while enabling parking users to search, book, and pay for parking spaces through blockchain smart contracts. The system improves transparency, security and trust by recording booking and payment transactions on a decentralised blockchain network. 

## Group Members 
- Kiara Mason
- Alicia Larme
  

## Stakeholders 

### Parking Space Provider (The user that deploys the smart contracts)
Creates, updates, and deletes parking spaces and receives payment from bookings on the SmartPark application within the provider page. 

### Parking User 
Select spaces, create bookings, complete or delete bookings and view bookings for parking spaces through blockchain-based transactions within both the home and bookings page. 

## Link to Github Repository 
https://github.com/kmason19/remix_a3_group12.git

## How to Deploy the Project 
1. Open Remix IDE
2. Upload the smartpark.sol document found within the a3 SmartPark Final Code (Group 12) folder into remix
3. Compile smartpark.sol and connect MetaMask wallet using browser extention (Sepolia Testnet - MetaMask) and select account, the wallet account chosen will act as the provider for the application
4. Deploy ParkingSpaceManagement smart contract (confirm through metamask) and copy contract address
5. Select to deploy BookingAndPayment contract and paste ParkingSpaceManagement contract address into the _parkingContractAddress input box, then deploy  BookingAndPayment contract (confirm through metamask)
6. Copy the deployed BookingAndPayment contract address
7. Select the setBookingContract function in the ParkingSpaceManagement contract and paste the BookingAndPayment contract address into the function's input box, then transact (confirm through metamask)
8. The address called within the bookingContract function in the ParkingSpaceManagement contract should match the deployed BookingAndPayment contract address
9. The address called within the parkingContract function in the BookingAndPayment contract should match the address of the deployed ParkingSpaceManagement contract
10. Open the folder a3 SmartPark Final Code (Group 12) into visual studion code
11. Copy the address of the ParkingSpaceManagement contract and paste it into the index, booking and provider HTML pages. Within these pages paste the address within these quotation marks of this line of code: const parkingContractAddress = " "; or this line: const contractAddress = " ";
12. Copy the address of the BookingAndPayment contract and paste it in the booking and provider HTML pages.
Within these pages paste the address within these quotation marks of this line of code: const bookingContractAddress = " ";
13. Open node.js command prompt in the right directory and type in lite-server to open the application up as a local host
14. If the MetaMask wallet does not connect press the connect wallet button under the SmartPark title on the home page of the application to connect it
15. Begin testing the functionality. Start by creating spaces within the provider pages and then go onto booking spaces.

 
## Features and Functionalities of Application
- Connect MetaMask Wallet to perform functions on inidividual accounts (correct connection should be checked when switching to a new page)
- Create new parking spaces (provider page) - only provider can do this
- Update parking space information (provider page) - only provider can do this
- Delete/deactivate parking spaces (provider page) - only provider can do this
- View created parking spaces (provider page) 
- View all created bookings (provider page)
- View total amount and retrieve payment from completed bookings (provider page) - only provider can do this - may need to refresh page to see new withdrawal amount after payment is withdrawn/retrieved 
- View available parking spaces (home/index page) - viewable by anyone
- Create parking bookings and pay for bookings (bookings page) - trigger booking creation by pressing the book button of the available parking space you want to book within the home page (automatically takes you to booking page afterwards)
- View booking summary when creating the booking (bookings page) - viewable as booking details are inputted into the booking creation section
- Complete bookings (done after the user is done with the parking space and allows the money from the booking to be given to the provider) or cancel (allows money to be refunded back to the user if the booking is no longer needed) bookings under manage bookings (bookings page)
- View your bookings (bookings page) - only view the bookings made by the connected wallet account
- View all recent bookings that have been booked by anyone (bookings page) - view the bookings of everyone (total amount of details and other more sensistive details are left out)
- Every page has a transaction status to alert if transactions have been successful or not - changes when a transaction is performed


## Smart Contracts and Contributions

### ParkingSpaceManagement.sol 
This smart contract manages parking space information within the SmartPark application (functions here can only be performed by providers who deployed the contracts). 

Functions include:
- setBookingContract - authorises the BookingAndPayment contract (done by Kiara)
- createSpace - creates parking spaces (done by Alicia)
- updateSpace - updates parking spaces (done by Kiara)
- deleteSpace - delete/deactivate parking spaces (done by Kiara)
- setAvailability - manage parking space availability (done by Kiara)
- getSpaceDetails - retrieves parking space details (allows for parking spaces to be viewed) (done by Alicia)

Initial set up of the ParkingSpaceManagement contract was performed by Alicia, who created:
- the original space struct
-  mapping for spaces
-  space counter
-  event that creates a new space
-  constructor
-  onlyProvider modifier

Kiara helped to edit the space struct, the events for updating and deleting spaces.

### BookingAndPayment.sol 
This smart contract manages parking bookings and payment transactions (every function except withdrawing funds can be performed by any user). 

Functions include:
- createBooking - creates bookings (done by Kiara)
- paymentsWithdraw (provider only) - allow providers to receive the total payment amount of completed bookings (done by Alicia)
- getContractBalance - allow providers to see the total amount of money from paid bookings (done by Alicia)
- cancelBooking - cancels existing bookings and refunds the cost of the booking back to the user who made the booking (done by Kiara, edited by Alicia to add refund functionality)
- completeBooking - completes the bookings after parking usage has finished and allows for the cost of that booking to now be withdrawn by the provider (done by Kiara, edited by Alicia to ensure the booking cost is added onto the amount providers can withdraw from)
- getBookingDetails - retrieves booking details (allows for bookings to be viewed) (done by Kiara)

Kiara created the initial setup for this contract and coded the other parts of the contract, except for the tasks Alicia did.

Alicia also created:
- provider constructor
- onlyProvider modifier
- Payment withdrawn event


## Front-end and connection to backend (HTML, CSS, JavaScript) Contributions

Front-end and connection to the back-end via JavaScript was mostly done by Kiara.

Alicia helped to set up the wallet connects on the booking and provider pages, added the HTML and JavaScript for the payment withdrawal functionalities (both viewing and withdrawing payment), changed the format of money to ETH on the frontend and helped finish off the commenting of the code.



## Technologies Used 
- Remix IDE (solidity)
- MetaMask
- Ethereum Blockchain
- GitHub



## License 
This project is developed for educational use for IFB452.

