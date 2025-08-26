// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyNFT.sol";
import "./Fraction.sol";

contract Fractionalizer is ReentrancyGuard, Pausable, Ownable {
    address public propertyNFTAddress;

    // KYC registry for compliance (placeholder for future implementation)
    mapping(address => bool) public kycVerified;

    struct FractionalizedNFT {
        address fractionToken;
        uint256 totalFractions;
        address originalOwner;
        uint256 timestamp;
        bool isActive;
    }

    mapping(uint256 => FractionalizedNFT) public fractionalizedNFTs;

    // Enhanced events for better tracking and compliance
    event NFTFractionalized(
        uint256 indexed tokenId, 
        address indexed fractionToken, 
        uint256 totalFractions, 
        address indexed originalOwner,
        uint256 timestamp
    );
    
    event NFTRedeemed(
        uint256 indexed tokenId, 
        address indexed redeemer,
        address fractionToken,
        uint256 timestamp
    );
    
    event KYCStatusUpdated(address indexed user, bool status);
    event EmergencyPause(address indexed admin, uint256 timestamp);
    event EmergencyUnpause(address indexed admin, uint256 timestamp);

    // Compliance modifier (placeholder for future KYC integration)
    modifier onlyKYC() {
        // For hackathon demo, this is disabled
        // require(kycVerified[msg.sender], "KYC verification required");
        _;
    }

    constructor(address _propertyNFTAddress) Ownable(msg.sender) {
        propertyNFTAddress = _propertyNFTAddress;
    }

    // Emergency pause functions
    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }

    // KYC management functions (placeholder for future compliance)
    function updateKYCStatus(address user, bool status) external onlyOwner {
        kycVerified[user] = status;
        emit KYCStatusUpdated(user, status);
    }

    function batchUpdateKYC(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            kycVerified[users[i]] = status;
            emit KYCStatusUpdated(users[i], status);
        }
    }

    function fractionalize(
        uint256 tokenId, 
        uint256 totalFractions, 
        string memory name, 
        string memory symbol
    ) public nonReentrant whenNotPaused onlyKYC {
        require(totalFractions > 0, "Total fractions must be greater than 0");
        require(totalFractions <= 1000000, "Total fractions cannot exceed 1,000,000");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        
        PropertyNFT propertyNFT = PropertyNFT(propertyNFTAddress);
        require(propertyNFT.ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(fractionalizedNFTs[tokenId].fractionToken == address(0), "NFT already fractionalized");

        // Transfer NFT to this contract
        propertyNFT.transferFrom(msg.sender, address(this), tokenId);

        // Deploy new fraction token
        Fraction fractionToken = new Fraction(name, symbol, address(this));

        // Store fractionalization data
        fractionalizedNFTs[tokenId] = FractionalizedNFT({
            fractionToken: address(fractionToken),
            totalFractions: totalFractions,
            originalOwner: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        });

        // Mint fraction tokens to the original owner
        fractionToken.mint(msg.sender, totalFractions);

        emit NFTFractionalized(tokenId, address(fractionToken), totalFractions, msg.sender, block.timestamp);
    }

    function redeem(uint256 tokenId) public nonReentrant whenNotPaused onlyKYC {
        FractionalizedNFT storage fnft = fractionalizedNFTs[tokenId];
        require(fnft.fractionToken != address(0), "NFT not fractionalized");
        require(fnft.isActive, "NFT fractionalization is not active");

        Fraction fractionToken = Fraction(fnft.fractionToken);
        require(fractionToken.balanceOf(msg.sender) == fnft.totalFractions, "You do not own all the fractions");

        // Store fraction token address for event emission
        address fractionTokenAddress = fnft.fractionToken;

        // Transfer all fraction tokens to this contract and burn them
        fractionToken.transferFrom(msg.sender, address(this), fnft.totalFractions);
        fractionToken.burn(fnft.totalFractions);

        // Transfer the original NFT back to the redeemer
        PropertyNFT propertyNFT = PropertyNFT(propertyNFTAddress);
        propertyNFT.transferFrom(address(this), msg.sender, tokenId);

        // Mark as inactive and clean up
        fnft.isActive = false;

        emit NFTRedeemed(tokenId, msg.sender, fractionTokenAddress, block.timestamp);
    }

    // View functions for enhanced transparency
    function getFractionalizationInfo(uint256 tokenId) external view returns (
        address fractionToken,
        uint256 totalFractions,
        address originalOwner,
        uint256 timestamp,
        bool isActive
    ) {
        FractionalizedNFT memory fnft = fractionalizedNFTs[tokenId];
        return (
            fnft.fractionToken,
            fnft.totalFractions,
            fnft.originalOwner,
            fnft.timestamp,
            fnft.isActive
        );
    }

    function isNFTFractionalized(uint256 tokenId) external view returns (bool) {
        return fractionalizedNFTs[tokenId].fractionToken != address(0) && 
               fractionalizedNFTs[tokenId].isActive;
    }

    function getFractionTokenAddress(uint256 tokenId) external view returns (address) {
        return fractionalizedNFTs[tokenId].fractionToken;
    }
}
