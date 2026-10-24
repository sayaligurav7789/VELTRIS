// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProductVerification
/// @notice Manufacturers register a product ID together with a hash of its details.
///         Anyone can later check a product by re-hashing the details printed on it.
contract ProductVerification {
    struct Product {
        bytes32 dataHash;      // keccak256 of the product details
        address manufacturer;  // who registered it
        uint64 registeredAt;
        bool revoked;
        bool exists;
    }

    address public owner;
    mapping(address => bool) public isManufacturer;
    mapping(bytes32 => Product) private products; // key = keccak256(productId)

    event ManufacturerSet(address indexed account, bool allowed);
    event ProductRegistered(string productId, bytes32 dataHash, address indexed manufacturer);
    event ProductRevoked(string productId, address indexed by);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        isManufacturer[msg.sender] = true;
        emit ManufacturerSet(msg.sender, true);
    }

    function setManufacturer(address account, bool allowed) external onlyOwner {
        isManufacturer[account] = allowed;
        emit ManufacturerSet(account, allowed);
    }

    function registerProduct(string calldata productId, bytes32 dataHash) external {
        require(isManufacturer[msg.sender], "Not an authorized manufacturer");
        require(bytes(productId).length > 0, "Empty product ID");
        bytes32 key = keccak256(bytes(productId));
        require(!products[key].exists, "Product ID already registered");

        products[key] = Product(dataHash, msg.sender, uint64(block.timestamp), false, true);
        emit ProductRegistered(productId, dataHash, msg.sender);
    }

    /// @notice Mark a product as recalled or counterfeit. Registering manufacturer or owner only.
    function revokeProduct(string calldata productId) external {
        bytes32 key = keccak256(bytes(productId));
        Product storage p = products[key];
        require(p.exists, "Product not found");
        require(msg.sender == p.manufacturer || msg.sender == owner, "Not allowed");
        require(!p.revoked, "Already revoked");
        p.revoked = true;
        emit ProductRevoked(productId, msg.sender);
    }

    /// @notice Check a product. `authentic` is true only if it is registered,
    ///         not revoked, and the supplied hash matches the stored one.
    function verifyProduct(string calldata productId, bytes32 dataHash)
        external
        view
        returns (bool authentic, bool registered, bool revoked, address manufacturer, uint64 registeredAt)
    {
        Product storage p = products[keccak256(bytes(productId))];
        registered = p.exists;
        revoked = p.revoked;
        manufacturer = p.manufacturer;
        registeredAt = p.registeredAt;
        authentic = p.exists && !p.revoked && p.dataHash == dataHash;
    }
}
