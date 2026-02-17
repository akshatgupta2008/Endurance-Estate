// Code for interacting with the Ethereum blockchain
import { ethers } from 'ethers';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

// ABI for a simple smart contract to store property agreements
const agreementContractABI = [
  "function createAgreement(string propertyId, string agreementHash, address seller, address buyer, uint256 price) public returns (uint256)",
  "function getAgreement(uint256 agreementId) public view returns (string, string, address, address, uint256, uint256)",
  "function confirmAgreement(uint256 agreementId) public",
  "event AgreementCreated(uint256 indexed agreementId, string propertyId, address indexed seller, address indexed buyer, uint256 price, uint256 timestamp)"
];

// This would be your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGREEMENT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

/**
 * Initialize connection to Ethereum network
 * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.Signer, contract: ethers.Contract}>}
 */
export const initializeBlockchain = async () => {
  // Check if window.ethereum is available (MetaMask or other wallet)
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet detected. Please install MetaMask or another compatible wallet.");
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get signer (authenticated account)
    const signer = await provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, agreementContractABI, signer);
    
    return { provider, signer, contract };
  } catch (error) {
    console.error("Failed to initialize blockchain connection:", error);
    throw error;
  }
};

/**
 * Create SHA-256 hash of agreement data
 * @param {Object} agreementData - The complete agreement data
 * @returns {Promise<string>} - Hash of the agreement
 */
export const createAgreementHash = async (agreementData) => {
  // Create a string representation of agreement data
  const agreementString = JSON.stringify(agreementData);
  
  // Convert string to ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(agreementString);
  
  // Create SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Generate blockchain transaction for property agreement
 * @param {Object} agreementData - Complete agreement data
 * @returns {Promise<Object>} - Transaction details
 */
export const generateBlockchainTransaction = async (agreementData) => {
  try {
    // Initialize blockchain connection
    const { contract, signer } = await initializeBlockchain();
    
    // Get seller and buyer addresses
    // Note: In a real implementation, these would be the actual Ethereum addresses of the parties
    // For demo, we're using a function to derive an address from their email
    const sellerAddress = await deriveAddressFromEmail(agreementData.sellerEmail);
    const buyerAddress = await deriveAddressFromEmail(agreementData.buyerEmail);
    
    // Create hash of agreement data for storage on blockchain
    const agreementHash = await createAgreementHash(agreementData);
    
    // Convert price to wei (blockchain format) - assuming price is in USD
    // In a real implementation, you would use an oracle for USD/ETH conversion
    const priceInWei = ethers.parseEther(
      (parseFloat(agreementData.agreementPrice) / 2000).toString() // Simplified ETH/USD conversion
    );
    
    // Submit transaction to blockchain
    const tx = await contract.createAgreement(
      agreementData.propertyData.propertyId,
      agreementHash,
      sellerAddress,
      buyerAddress,
      priceInWei
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract agreement ID from event logs
    const event = receipt.logs.find(log => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        return parsedLog.name === 'AgreementCreated';
      } catch (e) {
        return false;
      }
    });
    
    const parsedEvent = contract.interface.parseLog(event);
    const agreementId = parsedEvent.args.agreementId.toString();
    
    // Get block timestamp
    const block = await contract.provider.getBlock(receipt.blockNumber);
    
    // Save transaction details to Firestore
    await saveTransactionToFirestore(agreementData, receipt.hash, agreementId);
    
    // Return transaction details
    return {
      transactionId: receipt.hash,
      agreementId: agreementId,
      timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      network: (await contract.provider.getNetwork()).name
    };
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    
    // Fallback to simulated transaction for development or when blockchain is unavailable
    const simulatedTransaction = simulateBlockchainTransaction(agreementData);
    simulatedTransaction.simulated = true;
    
    return simulatedTransaction;
  }
};

/**
 * Simulate a blockchain transaction for testing or when blockchain is unavailable
 * @param {Object} agreementData - Agreement data
 * @returns {Object} - Simulated transaction details
 */
export const simulateBlockchainTransaction = (agreementData) => {
  const timestamp = new Date();
  const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
  const agreementId = Math.floor(Math.random() * 1000000).toString();
  
  // Simulate saving to Firestore
  setTimeout(() => {
    saveTransactionToFirestore(agreementData, txId, agreementId)
      .catch(err => console.error("Failed to save simulated transaction:", err));
  }, 500);
  
  return {
    transactionId: txId,
    agreementId: agreementId,
    timestamp: timestamp.toISOString(),
    status: 'confirmed',
    blockNumber: Math.floor(Math.random() * 1000000),
    network: 'development'
  };
};

/**
 * Save transaction details to Firestore
 * @param {Object} agreementData - Complete agreement data
 * @param {string} transactionHash - Blockchain transaction hash
 * @param {string} agreementId - Blockchain agreement ID
 * @returns {Promise<void>}
 */
export const saveTransactionToFirestore = async (agreementData, transactionHash, agreementId) => {
  // Create a new agreement document in Firestore
  const agreementRef = doc(db, 'agreements', agreementId);
  
  const transactionData = {
    propertyId: agreementData.propertyData.propertyId,
    transactionHash: transactionHash,
    agreementId: agreementId,
    sellerName: agreementData.sellerName,
    sellerEmail: agreementData.sellerEmail,
    buyerName: agreementData.buyerName,
    buyerEmail: agreementData.buyerEmail,
    price: parseFloat(agreementData.agreementPrice),
    downPayment: parseFloat(agreementData.downPayment),
    createdAt: new Date().toISOString(),
    status: 'active',
    closingDate: agreementData.closingDate
  };
  
  // Save to Firestore
  await updateDoc(agreementRef, transactionData);
};

/**
 * Derive an Ethereum address from an email (for demo purposes)
 * In a real implementation, users would connect their actual wallets
 * @param {string} email - User email
 * @returns {Promise<string>} - Ethereum address
 */
export const deriveAddressFromEmail = async (email) => {
  // Create a hash of the email
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as Ethereum address (0x + 40 chars)
  return '0x' + hashHex.substring(0, 40);
};

/**
 * Verify agreement on blockchain
 * @param {string} transactionId - Blockchain transaction ID
 * @returns {Promise<Object>} - Verification result
 */
export const verifyAgreement = async (transactionId) => {
  try {
    // Initialize blockchain connection
    const { provider } = await initializeBlockchain();
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionId);
    
    if (!receipt) {
      return { verified: false, reason: 'Transaction not found on blockchain' };
    }
    
    // Check if transaction was successful
    if (receipt.status === 0) {
      return { verified: false, reason: 'Transaction failed on blockchain' };
    }
    
    // Get transaction details and block info
    const transaction = await provider.getTransaction(transactionId);
    const block = await provider.getBlock(receipt.blockNumber);
    
    return {
      verified: true,
      blockNumber: receipt.blockNumber,
      timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
      confirmations: await provider.getBlockNumber() - receipt.blockNumber,
      from: transaction.from,
      to: transaction.to,
      gas: transaction.gasLimit.toString(),
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error("Verification failed:", error);
    return { verified: false, reason: error.message };
  }
};