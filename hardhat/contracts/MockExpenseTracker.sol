// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// DO NOT import FHE here
contract MockExpenseTracker {
 struct Expense {
 uint32 category;
 uint256 timestamp;
 uint32 amount; // store as normal uint32
 bool isDeleted;
 }

 mapping(address => Expense[]) private expenses;
 mapping(address => uint32) private total;

 event ExpenseAdded(address indexed user, uint32 category, uint256 timestamp, uint32 amount, uint256 index);
 event ExpenseDeleted(address indexed user, uint256 index, uint32 newTotal);

 function addExpense(
 uint32 category,
 uint256 timestamp,
 uint32 amount // no encryption!
 ) external {
 expenses[msg.sender].push(Expense(category, timestamp, amount, false));
 total[msg.sender] += amount;

 uint256 i = expenses[msg.sender].length - 1;
 emit ExpenseAdded(msg.sender, category, timestamp, amount, i);
 }

 function deleteExpense(uint256 index) external {
 require(index < expenses[msg.sender].length, "Invalid index");
 Expense storage exp = expenses[msg.sender][index];
 require(!exp.isDeleted, "Already deleted");

 total[msg.sender] -= exp.amount;
 exp.isDeleted = true;
 exp.amount = 0;

 emit ExpenseDeleted(msg.sender, index, total[msg.sender]);
 }

 function getEncryptedGlobalTotal(address user) external view returns (uint32) {
 return total[user];
 }

 function getExpenseCount(address user) external view returns (uint256) {
 return expenses[user].length;
 }

 function getEncryptedExpense(address user, uint256 index)
 external
 view
 returns (uint32 category, uint256 timestamp, uint32 amount, bool isDeleted)
 {
 Expense memory exp = expenses[user][index];
 return (exp.category, exp.timestamp, exp.amount, exp.isDeleted);
 }
}