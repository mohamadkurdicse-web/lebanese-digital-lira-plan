import { ethers } from "ethers";
import Web3 from "web3";

/**
 * Web3 Service - Handles blockchain interactions
 * Supports Ethereum and Polygon networks
 */

// Contract ABIs
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) returns (uint256)",
  "function decimals() returns (uint8)",
  "function symbol() returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const LBP_DIGITAL_ABI = [
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Mint(address indexed to, uint256 amount)",
  "event Burn(address indexed from, uint256 amount)",
];

interface BlockchainConfig {
  network: "ethereum" | "polygon" | "testnet";
  rpcUrl: string;
  privateKey: string;
  lbpContractAddress: string;
  usdtContractAddress: string;
}

export class Web3Service {
  private web3: Web3;
  private ethersProvider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.web3 = new Web3(config.rpcUrl);
    this.ethersProvider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.ethersProvider);
  }

  /**
   * Transfer LBP Digital tokens
   */
  async transferLBP(to: string, amount: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.lbpContractAddress,
        LBP_DIGITAL_ABI,
        this.wallet
      );

      const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
      const receipt = await tx.wait();

      if (!receipt) throw new Error("Transaction failed");
      return receipt.hash;
    } catch (error) {
      console.error("[Web3 Service] Failed to transfer LBP:", error);
      throw error;
    }
  }

  /**
   * Transfer USDT tokens
   */
  async transferUSDT(to: string, amount: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.usdtContractAddress,
        ERC20_ABI,
        this.wallet
      );

      const tx = await contract.transfer(to, ethers.parseUnits(amount, 6));
      const receipt = await tx.wait();

      if (!receipt) throw new Error("Transaction failed");
      return receipt.hash;
    } catch (error) {
      console.error("[Web3 Service] Failed to transfer USDT:", error);
      throw error;
    }
  }

  /**
   * Get LBP balance for an address
   */
  async getLBPBalance(address: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.lbpContractAddress,
        LBP_DIGITAL_ABI,
        this.ethersProvider
      );

      const balance = await contract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error("[Web3 Service] Failed to get LBP balance:", error);
      throw error;
    }
  }

  /**
   * Get USDT balance for an address
   */
  async getUSDTBalance(address: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.config.usdtContractAddress,
        ERC20_ABI,
        this.ethersProvider
      );

      const balance = await contract.balanceOf(address);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error("[Web3 Service] Failed to get USDT balance:", error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.ethersProvider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error("[Web3 Service] Failed to get transaction receipt:", error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string) {
    try {
      return await this.ethersProvider.getTransaction(txHash);
    } catch (error) {
      console.error("[Web3 Service] Failed to get transaction:", error);
      throw error;
    }
  }

  /**
   * Estimate gas for transfer
   */
  async estimateGasForTransfer(
    to: string,
    amount: string,
    tokenType: "LBP" | "USDT"
  ): Promise<string> {
    try {
      const contractAddress =
        tokenType === "LBP"
          ? this.config.lbpContractAddress
          : this.config.usdtContractAddress;
      const abi = tokenType === "LBP" ? LBP_DIGITAL_ABI : ERC20_ABI;
      const decimals = tokenType === "LBP" ? 18 : 6;

      const contract = new ethers.Contract(contractAddress, abi, this.wallet);

      const gasEstimate = await contract.transfer.estimateGas(
        to,
        ethers.parseUnits(amount, decimals)
      );

      return gasEstimate.toString();
    } catch (error) {
      console.error("[Web3 Service] Failed to estimate gas:", error);
      throw error;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.ethersProvider.getFeeData();
      if (!feeData.gasPrice) throw new Error("Unable to fetch gas price");
      return ethers.formatUnits(feeData.gasPrice, "gwei");
    } catch (error) {
      console.error("[Web3 Service] Failed to get gas price:", error);
      throw error;
    }
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const network = await this.ethersProvider.getNetwork();
      const blockNumber = await this.ethersProvider.getBlockNumber();
      const gasPrice = await this.getGasPrice();

      return {
        network: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice,
      };
    } catch (error) {
      console.error("[Web3 Service] Failed to get network info:", error);
      throw error;
    }
  }

  /**
   * Listen to transfer events
   */
  listenToTransfers(
    tokenType: "LBP" | "USDT",
    callback: (from: string, to: string, amount: string) => void
  ) {
    try {
      const contractAddress =
        tokenType === "LBP"
          ? this.config.lbpContractAddress
          : this.config.usdtContractAddress;
      const abi = tokenType === "LBP" ? LBP_DIGITAL_ABI : ERC20_ABI;
      const decimals = tokenType === "LBP" ? 18 : 6;

      const contract = new ethers.Contract(
        contractAddress,
        abi,
        this.ethersProvider
      );

      contract.on("Transfer", (from, to, value) => {
        const amount = ethers.formatUnits(value, decimals);
        callback(from, to, amount);
      });
    } catch (error) {
      console.error("[Web3 Service] Failed to listen to transfers:", error);
    }
  }
}

// Initialize Web3 service with environment variables
export function initializeWeb3Service(): Web3Service {
  const config: BlockchainConfig = {
    network: (process.env.BLOCKCHAIN_NETWORK as "ethereum" | "polygon" | "testnet") || "polygon",
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "https://polygon-rpc.com",
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || "",
    lbpContractAddress: process.env.LBP_CONTRACT_ADDRESS || "",
    usdtContractAddress: process.env.USDT_CONTRACT_ADDRESS || "",
  };

  if (!config.privateKey || !config.lbpContractAddress || !config.usdtContractAddress) {
    throw new Error("Missing required blockchain configuration");
  }

  return new Web3Service(config);
}
