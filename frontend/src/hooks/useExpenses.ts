// @ts-ignore
import { createEncryptedInput, decryptValue, initializeFheInstance } from "../lib/fhevm";

import { useEffect, useState } from "react";
import { EXPENSE_TRACKER_ADDRESS, EXPENSE_TRACKER_ABI } from "../utils/contract";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import useFhevmSetup from "./useFhevmSetup";
import { CATEGORIES } from "../utils/categories";

export interface ExpenseRow {
 index: number;
 category: string;
 amount: number;
 timestamp: string;
}

export default function useExpenses() {
 const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
 const [decryptedTotal, setDecryptedTotal] = useState<number | null>(null);
 const { address, isConnected } = useAccount();
 const chainId = useChainId();
 const { isInitialized } = useFhevmSetup();

 const getProvider = () => new ethers.BrowserProvider(window.ethereum as any);
 const getSigner = async () => (await getProvider()).getSigner();
 const getContract = async () =>
 new ethers.Contract(EXPENSE_TRACKER_ADDRESS, EXPENSE_TRACKER_ABI, await getSigner());

 // Auto-clear local cache on wallet disconnect
 useEffect(() => {
 if (!isConnected) {
 localStorage.removeItem("reportData");
 localStorage.removeItem("reportTotal");
 localStorage.removeItem("reportLastDecrypted");
 setDecryptedTotal(null);
 setExpenses([]);
 }
 }, [isConnected]);

 // Load encrypted data once ready
 useEffect(() => {
 if (isConnected && chainId === 11155111 && isInitialized) {
 loadExpenses();
 }
 }, [isConnected, chainId, isInitialized]);

 async function ensureReady(notify?: (msg: string) => void): Promise<boolean> {
 if (!isConnected) return notify?.(" Connect your wallet first"), false;
 if (chainId !== 11155111) return notify?.(" Switch to Sepolia"), false;

 if (!isInitialized) {
 notify?.(" Initializing privacy engine…");
 try {
 await initializeFheInstance();
 } catch (err) {
 notify?.(" Privacy engine unavailable");
 return false;
 }
 }

 return true;
 }

 async function loadExpenses(notify?: (msg: string) => void) {
 if (!(await ensureReady(notify))) return;
 try {
 const contract = await getContract();
 const count = Number(await contract.getExpenseCount(address!));
 const records: ExpenseRow[] = [];

 for (let i = 0; i < count; i++) {
 const [catId, timestamp, encrypted, isDeleted] =
 await contract.getEncryptedExpense(address!, i);

 if (isDeleted || /^0x0+$/.test(encrypted)) continue;

 records.push({
 index: i,
 category: CATEGORIES[Number(catId)] || "Unknown",
 amount: 0,
 timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
 });
 }
 setExpenses(records.reverse());
 } catch (err) {
 console.error(err);
 notify?.(" Failed to load expenses");
 }
 }

 async function decryptTotal(notify?: (msg: string) => void) {
 if (!(await ensureReady(notify))) return;
 if (expenses.length === 0) return notify?.(" No on-chain data to decrypt");

 try {
 const contract = await getContract();
 const signer = await getSigner();
 let handle = await contract.getEncryptedGlobalTotal(address!);

 if (typeof handle === "bigint") handle = "0x" + handle.toString(16).padStart(64, "0");

 const total = await decryptValue(handle, EXPENSE_TRACKER_ADDRESS, signer);
 const decryptedExpenses = await Promise.all(
 expenses.map(async (e) => {
 let rawAmount = (await contract.getEncryptedExpense(address!, e.index))[2];
 if (typeof rawAmount === "bigint")
 rawAmount = "0x" + rawAmount.toString(16).padStart(64, "0");

 return { ...e, amount: await decryptValue(rawAmount, EXPENSE_TRACKER_ADDRESS, signer) };
 })
 );

 setExpenses(decryptedExpenses);
 setDecryptedTotal(total);

 localStorage.setItem("reportData", JSON.stringify(decryptedExpenses));
 localStorage.setItem("reportTotal", String(total));
 localStorage.setItem("reportLastDecrypted", new Date().toISOString());

 notify?.(` Decryption successful: $${total}`);
 } catch (err) {
 console.error(err);
 notify?.(" Decryption failed or cancelled");
 }
 }

 async function addExpense(category: string, amount: number, notify?: (msg: string) => void) {
 if (amount <= 0) return notify?.(" Invalid amount");
 if (!(await ensureReady(notify))) return;

 try {
 const contract = await getContract();
 const encrypted = await createEncryptedInput(EXPENSE_TRACKER_ADDRESS, address!, amount);
 const timestamp = BigInt(Math.floor(Date.now() / 1000));

 await (await contract.addExpense(CATEGORIES.indexOf(category), timestamp, encrypted.encryptedData, encrypted.proof)).wait();
 setDecryptedTotal(null);
 notify?.(" Expense added");
 loadExpenses();
 } catch (err: any) {
 console.error(err);
 notify?.(` Add failed: ${err.message}`);
 }
 }

 async function deleteExpense(id: number, notify?: (msg: string) => void) {
 if (!(await ensureReady(notify))) return;
 try {
 const contract = await getContract();
 await (await contract.deleteExpense(id)).wait();
 notify?.(" Expense deleted.. decrpyt new total");
 setDecryptedTotal(null);
 loadExpenses();
 } catch (err: any) {
 notify?.("Cancelled Delete");
 }
 }

 return { expenses, decryptedTotal, addExpense, deleteExpense, decryptTotal };
}