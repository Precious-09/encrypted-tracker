import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying FHE contracts...");
  
  // Deploy FHECounter contract
  console.log("Deploying FHECounter contract...");


  const Expense = await hre.ethers.getContractFactory("EncryptedExpenseTracker");
const expense = await Expense.deploy();
await expense.waitForDeployment();
const expenseT = await expense.getAddress();
console.log(`EncryptedExpenseTracker_uint32 contract deployed to: ${expenseT}`);
  

  console.log(`EncryptedExpenseTracker contract deployed to: ${expenseT}`);
}

// Export the main function for hardhat-deploy
export default main;