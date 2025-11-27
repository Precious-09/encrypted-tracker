// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {
    FHE,
    externalEuint32,
    euint32
} from "@fhevm/solidity/lib/FHE.sol";

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedExpenseTracker is ZamaEthereumConfig {
    struct Expense {
        uint32 category;    // plaintext category ID (index in your CATEGORIES)
        uint256 timestamp;  // plaintext unix timestamp
        euint32 amount;     // encrypted amount
        bool isDeleted;     // soft delete flag
    }

    // All expenses per user
    mapping(address => Expense[]) private expenses;

    // Global encrypted total per user
    mapping(address => euint32) private userTotal;

    event ExpenseAdded(
        address indexed user,
        uint32 category,
        uint256 timestamp,
        bytes32 amountHandle,
        uint256 index
    );

    event ExpenseDeleted(
        address indexed user,
        uint256 index,
        bytes32 newTotalHandle
    );

    event TotalUpdated(
        address indexed user,
        bytes32 newTotalHandle
    );

    // =========================================================
    // ADD EXPENSE
    // =========================================================
    function addExpense(
        uint32 category,
        uint256 timestamp,
        externalEuint32 amountExt,
        bytes calldata proof
    ) external {
        // Convert external encrypted value using proof
        euint32 amount = FHE.fromExternal(amountExt, proof);

        // Permissions: contract + user
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);

        // Store expense
        expenses[msg.sender].push(
            Expense({
                category: category,
                timestamp: timestamp,
                amount: amount,
                isDeleted: false
            })
        );

        // Update global encrypted total
        euint32 prevTot = userTotal[msg.sender];
        euint32 newTot = FHE.add(prevTot, amount);

        userTotal[msg.sender] = newTot;

        // Allow new total for contract + user
        FHE.allowThis(newTot);
        FHE.allow(newTot, msg.sender);

        uint256 idx = expenses[msg.sender].length - 1;

        emit ExpenseAdded(
            msg.sender,
            category,
            timestamp,
            FHE.toBytes32(amount),
            idx
        );

        emit TotalUpdated(
            msg.sender,
            FHE.toBytes32(newTot)
        );
    }

    // =========================================================
    // DELETE EXPENSE (recalculate encrypted total)
    // =========================================================
    function deleteExpense(uint256 index) external {
        require(index < expenses[msg.sender].length, "Invalid index");

        Expense storage exp = expenses[msg.sender][index];
        require(!exp.isDeleted, "Already deleted");

        // Subtract encrypted amount from global total
        euint32 prevTot = userTotal[msg.sender];
        euint32 newTot = FHE.sub(prevTot, exp.amount);

        userTotal[msg.sender] = newTot;

        // Mark expense as deleted and zero-out amount
        exp.isDeleted = true;
        exp.amount = FHE.asEuint32(0); // will show as 0x00.. in frontend

        // Allow new total for contract + user
        FHE.allowThis(newTot);
        FHE.allow(newTot, msg.sender);

        emit ExpenseDeleted(
            msg.sender,
            index,
            FHE.toBytes32(newTot)
        );

        emit TotalUpdated(
            msg.sender,
            FHE.toBytes32(newTot)
        );
    }

    // =========================================================
    // VIEWS
    // =========================================================

    function getEncryptedGlobalTotal(address user)
        external
        view
        returns (bytes32)
    {
        return FHE.toBytes32(userTotal[user]);
    }

    function getExpenseCount(address user)
        external
        view
        returns (uint256)
    {
        return expenses[user].length;
    }

    function getEncryptedExpense(address user, uint256 index)
    external
    view
    returns (
        uint32 category,
        uint256 timestamp,
        bytes32 amountHandle,
        bool isDeleted
    )
{
    require(index < expenses[user].length, "Invalid index");
    Expense storage exp = expenses[user][index];

    return (
        exp.category,
        exp.timestamp,
        FHE.toBytes32(exp.amount),
        exp.isDeleted
    );
}

}