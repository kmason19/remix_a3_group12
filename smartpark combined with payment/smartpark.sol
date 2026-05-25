// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//PARKING MANAGEMENT AND SPACE CREATION CONTRACT
// Contract responsible for creating, updating, cancelling and deleting spaces
contract ParkingSpaceManagement {

    // The contract parking provider address
    address public provider;
    // Stores the address of the BookingAndPayment Contract
    address public bookingContract;

    //PARKING SPACE DETAILS
    // Struct to define the structure of a parking space details
    struct Space {
         string spaceName; //name of parking space for identification
         uint256 pricePerHour; //price of the park space
         string location; //location of space
         bool isAvailable; // parking space status (true = can be booked, false = unavailable/booked)
         bool isDeleted; // parking space status (true = deleted/deactivated) 
         uint256 timestamp;  //time parking space was created
    }  

    // Mapping to store space information based on space ID
    mapping (uint256 => Space) public spaces;

    // Counter to keep track of the total number of sapces
    uint256 public spaceCount;

     // Event triggered when a new parking space is created
    event SpaceCreated(uint256 spaceId, string spaceName, uint256 pricePerHour, string location, bool isAvailable, bool isDeleted, uint256 timestamp);
    // Event triggered when a parking space is updated
    event SpaceUpdated(uint256 spaceId, string spaceName, uint256 pricePerHour, string location, bool isAvailable, bool isDeleted, uint256 timestamp);
    // Event triggered when a parking space is deleted 
    event SpaceDeleted(uint256 spaceId, uint256 timestamp);
    // Event triggered when parking space availability is changed
    event AvailabilityUpdated(uint256 spaceId, bool isAvailable);


    // Contract constructor, executed once during deployment
    constructor() {
        // Set the contract provider to the address that deploys the contract
        provider = msg.sender;
    }


    // Modifier to restrict access to only the contract owner (provider)
    modifier onlyProvider() {
        require(msg.sender == provider, "Only the parking space provider can execute this");
        _;
    }

    // Modifier used to allow access to either the parking provider or the authorised booking contract
    modifier onlyProviderOrBookingContract() {
        require(msg.sender == provider || msg.sender == bookingContract, "Only provider or booking contract can execute this"); 
        _;
    }


    //SET BOOKING CONTRACT
    // Function used to authorise the BookingAndPayment contract to update parking availability
    function setBookingContract(address _bookingContract) public onlyProvider {
        bookingContract = _bookingContract; // Store the authorised booking contract address
    }


    //CREATE NEW PARKING SPACE
    // Function to create a new parking space (only done by provider/owner)
    function createSpace(string memory _spaceName, uint256 _pricePerHour, string memory _location) public onlyProvider {
        // Increment spaceCount to generate a unique space ID
        spaceCount++;
        
        // Create a new parking space and store it in the parking space mapping
        spaces[spaceCount] = Space(_spaceName, _pricePerHour, _location, true, false, block.timestamp);
        
        // Emit an event to signify the creation of a new parking space
        emit SpaceCreated(spaceCount,  _spaceName, _pricePerHour, _location, true, false, block.timestamp);
    }


    //UPDATE PARKING SPACE
    // Function used to update an existing parking space (only done by provider/owner)
    function updateSpace(uint256 _spaceId, string memory _spaceName, uint256 _pricePerHour, string memory _location, bool _isAvailable) public onlyProvider {
        // Validate that the parking space ID exists 
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        //Validates parking space is not deleted
        require(!spaces[_spaceId].isDeleted, "Space has been deleted");

        // Update parking space details in the mapping
        spaces[_spaceId] = Space(_spaceName, _pricePerHour, _location, _isAvailable, false, block.timestamp);
        
        // Emit event to record the update transaction
        emit SpaceUpdated(_spaceId, _spaceName, _pricePerHour, _location, _isAvailable, false, block.timestamp);
    }


    //DELETE PARKING SPACE
    // Function used to deactivate/delete a parking space (only done by provider/owner)
    function deleteSpace(uint256 _spaceId) public onlyProvider {
        // Validate that the parking space ID exists
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        //Validates parking space is not already deleted
        require(!spaces[_spaceId].isDeleted, "Space has already been deleted");

        // Set availability to false instead of permanently deleting data
        spaces[_spaceId].isAvailable = false; 
        //Set delete to true to indicate the space has been deleted
        spaces[_spaceId].isDeleted = true;

        // Emit event to record the delection/deactiviation
        emit SpaceDeleted(_spaceId, block.timestamp);
    }


    //UPDATE AVAILABILITY OF PARKING SPACE
    // Function used to manually update parking space availability
    function setAvailability(uint256 _spaceId, bool _isAvailable) public onlyProviderOrBookingContract {
        // Validate that the parking space ID exists
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        //Validates parking space is not deleted
        require(!spaces[_spaceId].isDeleted, "Space has been deleted");

        // Update the availability status of the parking space
        spaces[_spaceId].isAvailable = _isAvailable;

        // Emit event to record the availability update
        emit AvailabilityUpdated(_spaceId, _isAvailable);
    }


    // GET PARKING SPACE DETAILS
    // Function to get details of a specific parking based on its ID (MAY NOT NEED THIS)
    function getSpaceDetails(uint256 _spaceId) public view returns (string memory, uint256, string memory, bool, bool, uint256) {
        // Check if the provided product ID is valid
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        
        // Retrieve and return the details of the specified parking space
        Space  storage parkingSpace = spaces[_spaceId];
        return (parkingSpace.spaceName, parkingSpace.pricePerHour, parkingSpace.location, parkingSpace.isAvailable, parkingSpace.isDeleted, parkingSpace.timestamp);
    }

}



//BOOKING AND PAYMENT CONTRACT
// Contract responsible for handling bookings and payment-related functionality
contract BookingAndPayment {
    // The contract parking provider address
    address public provider;
   
    // Reference to the deployed ParkingSpaceManagement Contract
    ParkingSpaceManagement public parkingContract;

    // BOOKING AND PAYMENT DETAILS
    // Struct used to store booking information
    struct Booking {
        uint256 bookingId; // unique ID for each booking
        uint256 spaceId; // ID of the parking space being booked
        address user; // wallet address of the booking user 
        uint256 durationHours; // selected booking duration
        uint256 totalAmount; // calculated total price
        bool isPaid; // payment status of the booking
        bool isCancelled; // cancellation status of the booking
        bool isCompleted; // completion status of the booking
        uint256 timestamp; // time booking was created
    }

    // Mapping used to store bookings based on booking ID
    mapping(uint256 => Booking) public bookings;

    // Counter used to track the total number of bookings
    uint256 public bookingCount; 

    //records the total payment amounts of completed bookings the provider can withdraw
    uint256 public providerPaymentsreceived;

    // Event triggered when a booking is successfully created
    event BookingCreated(uint256 bookingId, uint256 spaceId, address user, uint256 durationHours, uint256 totalAmount, uint256 timestamp);
    // Event triggered when a booking is cancelled
    event BookingCancelled(uint256 bookingId, uint256 spaceId, address user);
    // Event triggered when a booking is completed
    event BookingCompleted(uint256 bookingId, uint256 spaceId, address user);


    // Constructor used to connect the BookingAndPayment contract to the ParkingSpaceManagement contract
    constructor(address _parkingContractAddress){
        // Store reference to deployed ParkingSpaceManagement contract
        parkingContract = ParkingSpaceManagement(_parkingContractAddress);
        // allows for the person who delpoys the contact to recieve ether later on
        provider = msg.sender;
    }


    // CREATE NEW BOOKING
    // Function used to create new parking booking (it is marked as payable to allow users to pay total booking amount)
    // Retrieve parking space details from the ParkingSpaceManagement contract
    function createBooking(uint256 _spaceId, uint256 _durationHours) public payable{
        ( , uint256 pricePerHour, , bool isAvailable, bool isDeleted, ) = parkingContract.getSpaceDetails(_spaceId);
        
        // Validate selected booking duration
        require(_durationHours == 1 || _durationHours == 2 || _durationHours == 4 || _durationHours == 6 || _durationHours == 24, "Invalid duration option");
        // Calculate total booking cost based on hourly price and selected duration by multiplying them together
        uint256 totalAmount = pricePerHour * _durationHours;

        require(msg.value == totalAmount, "Incorrect payment amount");
        // Validates parking space is available to allow for booking
        require(isAvailable, "Parking Space is not available");
        // Validates parking space is not deleted to allow for booking
        require(!isDeleted, "Parking Space has been deleted");

        // Increment booking count to generate a unique booking ID
        bookingCount++;

        // Store the booking information in the bookings mapping
        bookings[bookingCount] = Booking(bookingCount, _spaceId, msg.sender, _durationHours, totalAmount, true, false, false, block.timestamp);
        
        // Automatically mark the park space as unavailable after booking by changing availability to false
        parkingContract.setAvailability(_spaceId, false);

        // Emit event to record the booking transaction
        emit BookingCreated(bookingCount, _spaceId, msg.sender, _durationHours, totalAmount, block.timestamp);
    }


   // Modifer to restrict access to only the provider/owner
   modifier onlyProvider() {
    require(msg.sender == provider, "Only provider can execute this");
    _;
   }

   //Event triggered when payment is withdrawn by provider
   event PaymentWithdrawn(address provider, uint256 totalAmount);


   //WITHDRAW/RECIEVE PAYMENTS (FOR PROVIDERS)
   //Function that allows provider/owner to recieve/withdraw total payment amount of completed bookings
   function paymentsWithdraw() public onlyProvider {
        // Validates if there are payments to withdraw
        require(providerPaymentsreceived > 0, "No funds available" );

        // have eth amount provider will recieve equal to the total payment amount of completed bookings
        uint256 amount = providerPaymentsreceived;
        // Set variable that stores total payment amount of completed bookings back to 0 as all funds are withdrawn
        providerPaymentsreceived = 0;

        //Sends payment amount to the provider wallet
        (bool sent, ) = payable(provider).call{value: amount}("");
        require(sent, "Transfer failed");

        //Emit payment withdraw
        emit PaymentWithdrawn(provider, amount);
    }


    // VIEW PAYMENT AMOUNT IN SMART CONTRACT
    //Allows users to view the total payment amount of all paid bookings the BookingandPayment contract holds
    function getContractBalance() public view returns (uint256) {
    //returns total payment amount
    return address(this).balance;
    }


    //CANCEL BOOKING
    // Function used to cancel an existing booking
    function cancelBooking(uint256 _bookingId) public {
        // Validates a correct booking ID is submitted
        require(_bookingId > 0 && _bookingId <= bookingCount, "Invalid Booking ID");

        // Retrieve booking information from the bookings mapping
        Booking storage booking = bookings[_bookingId];

        //Validation to ensure only the user who placed the booking can cancel it
        require(msg.sender == booking.user, "Only the booking user can cancel this booking");
        //Validation to prevent already cancelled bookings from being cancelled again 
        require(!booking.isCancelled, "Booking already cancelled");
        //Validation to prevent completed bookings from being cancelled 
        require(!booking.isCompleted, "Booking already completed");
        //Validation to ensure bookingandpayment smart contract has sufficient to refund payment back to user who cancels the booking
        require(address(this).balance >= booking.totalAmount, "Contract balance is inufficient for refund");
        
        // Update booking cancellation status to true as booking is cancelled
        booking.isCancelled = true; 
        //Update booking paid status to false as payment is refunded
         booking.isPaid = false;

        // Make the parking space available again after cancellation by setting availability back to true
        parkingContract.setAvailability(booking.spaceId, true);

        //Refunds booking payment back to user who placed booking
        (bool refunded, ) = payable(booking.user).call{value: booking.totalAmount}("");
        require(refunded, "Refund failed");

        // Emit event to record the booking cancel transaction
        emit BookingCancelled(_bookingId, booking.spaceId, msg.sender);
    }


    // COMPLETE BOOKING
    // Function used to complete a booking after parking usage has finished
    function completeBooking(uint256 _bookingId) public {
        // Validates a correct booking ID is submitted
        require(_bookingId > 0 && _bookingId <= bookingCount, "Invalid Booking ID");

        // Retrieve booking information from the bookings mapping
        Booking storage booking = bookings[_bookingId];

        //Validation to ensure only the user who placed the booking can complete it
        require(msg.sender == booking.user, "Only the booking user can complete this booking");
        //Validation to prevent cancelled bookings from being completed
        require(!booking.isCancelled, "Booking was cancelled");
        //Validation to prevent already completed bookings from being completed again 
        require(!booking.isCompleted, "Booking already completed");

        // Update booking completion status to true as booking is completed
        booking.isCompleted = true;

        //adds the total amount of booking to the payment the provider can receive and withdraw
        providerPaymentsreceived += booking.totalAmount;

        // Make the parking space available again after booking completion by setting availability to true
        parkingContract.setAvailability(booking.spaceId, true);

        // Emit event to record the booking completion transaction
        emit BookingCompleted(_bookingId, booking.spaceId, msg.sender);
    }


    // GET BOOKING DETAILS
    // Function used to retrive details of a specific booking
    function getBookingDetails(uint256 _bookingId) public view returns (uint256, uint256, address, uint256, uint256, bool, bool, bool, uint256)
    {
        // Validates a correct booking ID is submitted
        require(_bookingId > 0 && _bookingId <= bookingCount, "Invalid Booking ID");
        
        // Retrieve booking information from the bookings mapping
        Booking storage booking = bookings[_bookingId];

        //Returns relevant booking information of selected booking ID
        return (booking.bookingId, booking.spaceId, booking.user, booking.durationHours, booking.totalAmount, booking.isPaid, booking.isCancelled, booking.isCompleted, booking.timestamp);
    }
}
