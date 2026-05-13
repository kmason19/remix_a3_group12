// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//this is alicia
//this is kiara
contract ParkingSpaceManagement {

    // The contract parking provider address
    address public provider;
    
    // Struct to define the structure of a parking space details
    struct space {
         string spaceName; //name of parking space for identification
         string price; //price of the park space
         string location; //location of space
         bool isAvailable; // parking space status (booking availability)
         bool isDeleted; // parking space status (deletion/deactivation) 
         uint256 timestamp;  //time parking space was created
    }  

    // Mapping to store space information based on space ID
    mapping (uint256 => space) public spaces;

    // Counter to keep track of the total number of sapces
    uint256 public spaceCount;

     // Event triggered when a new parking space is created
    event SpaceCreated(uint256 spaceId, string spaceName, string price, string location, bool isAvailable, bool isDeleted, uint256 timestamp);
    // Event triggered when a parking space is updated
    event SpaceUpdated(uint256 spaceId, string spaceName, string price, string location, bool isAvailable, uint256 timestamp);
    // Event triggered when a parking space is deleted 
    event SpaceDeleted(uint256 spaceId, uint256 timestamp);
    // Event triggered when parking space availability is changed
    event AvailabilityUpdated(uint256 spaceId, bool isAvailable);


    // Contract constructor, executed once during deployment
    constructor() {
        // Set the contract provider to the address that deploys the contract
        provider = msg.sender;
    }

      // Modifier to restrict access to only the contract owner
    modifier onlyProvider() {
        require(msg.sender == provider, "Only the parking space provider can execute this");
        _;
    }



     // Function to create a new parking space
    function createSpace(string memory _spaceName, string memory _price, string memory _location) public onlyProvider {
        // Increment spaceCount to generate a unique space ID
        spaceCount++;
        
        // Create a new parking space and store it in the parking space mapping
        spaces[spaceCount] = space(_spaceName, _price, _location, true, false, block.timestamp);
        
        // Emit an event to signify the creation of a new parking space
        emit SpaceCreated(spaceCount,  _spaceName, _price, _location, true, false, block.timestamp);
    }
    // Function used to update an existing parking space 
    function updateSpace(uint256 _spaceId, string memory _spaceName, string memory _price, string memory _location, bool _isAvailable, bool _isDeleted) public onlyProvider {
        // Validate that the parking space ID exists 
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        // Update parking space details in the mapping
        spaces[_spaceId] = space(_spaceName, _price, _location, _isAvailable, _isDeleted, block.timestamp);
        // Emit event to record the update transaction
        emit SpaceUpdated(_spaceId, _spaceName, _price, _location, _isAvailable, block.timestamp);
    }
    // Function used to deactivate/delete a parking space 
    function deleteSpace(uint256 _spaceId) public onlyProvider {
        // Validate that the parking space ID exists
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        // Set availability to false instead of permanently deleting data
        spaces[_spaceId].isAvailable = false; 
        spaces[_spaceId].isDeleted = true;
        // Emit event to record the delection/deactiviation
        emit SpaceDeleted(_spaceId, block.timestamp);
    }
    // Function used to manually update parking space availability
    function setAvailability(uint256 _spaceId, bool _isAvailable) public onlyProvider {
        // Validate that the parking space ID exists
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        // Update the availability status of the parking space
        spaces[_spaceId].isAvailable = _isAvailable;
        // Emit event to record the availability update
        emit AvailabilityUpdated(_spaceId, _isAvailable);
    }


    // Function to get details of a specific parking based on its ID (MAY NOT NEED THIS)
    function getSpaceDetails(uint256 _spaceId) public view returns (string memory, string memory, string memory, bool, bool, uint256) {
        // Check if the provided product ID is valid
        require(_spaceId > 0 && _spaceId <= spaceCount, "Invalid Space ID");
        
        // Retrieve and return the details of the specified parking space
        space  storage space = spaces[_spaceId];
        return (space.spaceName, space.price, space.location, space.isAvailable, space.isDeleted, space.timestamp);



    }




}

