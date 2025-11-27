// @ts-ignore
import { createEncryptedInput, decryptValue } from "../../fhevm-sdk/dist/index.js";

import { useEffect, useState } from "react";
import { EXPENSE_TRACKER_ADDRESS, EXPENSE_TRACKER_ABI } from "../utils/contract";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import { CATEGORIES } from "../utils/categories";
import useFhevmSetup from "./useFhevmSetup";

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
    new ethers.Contract(
      EXPENSE_TRACKER_ADDRESS,
      EXPENSE_TRACKER_ABI,
      await getSigner()
    );

  const ensureReady = (notify?: (msg: string) => void): boolean => {
    if (!isConnected) return notify?.("🔌 Connect wallet first"), false;
    if (!isInitialized) return notify?.("⏳ Initializing privacy engine..."), false;
    if (chainId !== 11155111) return notify?.("⚠ Switch to Sepolia"), false;
    return true;
  };

  // 🔄 Clear decrypted report ONLY when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      localStorage.removeItem("reportData");
      localStorage.removeItem("reportTotal");
      localStorage.removeItem("reportLastDecrypted");
      setDecryptedTotal(null);
      setExpenses([]);
    }
  }, [isConnected]);

  // 🔄 Load encrypted expenses when everything is ready
  useEffect(() => {
    if (isConnected && chainId === 11155111 && isInitialized) {
      loadExpenses();
    }
  }, [isConnected, chainId, isInitialized]);

  async function loadExpenses(notify?: (msg: string) => void) {
    if (!ensureReady(notify)) return;

    try {
      const contract = await getContract();
      const count: bigint = await contract.getExpenseCount(address!);

      const history: ExpenseRow[] = [];

      for (let i = 0; i < Number(count); i++) {
        const [catId, timestamp, encrypted, isDeleted] =
          await contract.getEncryptedExpense(address!, i);

        // skip deleted / zeroed entries
        if (isDeleted || /^0x0+$/.test(encrypted)) continue;

        history.push({
          index: i,
          category: CATEGORIES[Number(catId)] || "Unknown",
          amount: 0, // still encrypted, will fill in later on decrypt
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        });
      }

      setExpenses(history.reverse());
    } catch (err) {
      console.error("❌ Load error:", err);
      notify?.("❌ Failed to load expenses");
    }
  }

  // 🔓 Decrypt global total + each expense
  async function decryptTotal(notify?: (msg: string) => void) {
    if (!ensureReady(notify)) return;

    if (expenses.length === 0) {
      return notify?.("📭 Nothing left on-chain.");
    }

    try {
      const contract = await getContract();
      let handle = await contract.getEncryptedGlobalTotal(address!);

      if (typeof handle === "bigint") {
        handle = "0x" + handle.toString(16).padStart(64, "0");
      }

      const signer = await getSigner();

      // 1️⃣ decrypt global total
      const total = await decryptValue(handle, EXPENSE_TRACKER_ADDRESS, signer);

      // 2️⃣ decrypt each individual expense amount
      const decryptedExpenses = await Promise.all(
        expenses.map(async (e) => {
          try {
            let rawAmount = (await contract.getEncryptedExpense(address!, e.index))[2];

            if (typeof rawAmount === "bigint") {
              rawAmount = "0x" + rawAmount.toString(16).padStart(64, "0");
            }

            const amountDecrypted = await decryptValue(
              rawAmount,
              EXPENSE_TRACKER_ADDRESS,
              signer
            );

            return { ...e, amount: amountDecrypted };
          } catch (err) {
            console.warn("Decrypt single expense failed, defaulting to 0:", err);
            return { ...e, amount: 0 };
          }
        })
      );

      setExpenses(decryptedExpenses);
      setDecryptedTotal(total);

      // 🧠 Cache for the Report page
      localStorage.setItem("reportData", JSON.stringify(decryptedExpenses));
      localStorage.setItem("reportTotal", String(total));
      localStorage.setItem("reportLastDecrypted", new Date().toISOString());

      notify?.(`🔓 Decryption successful: $${total}`);
    } catch (err) {
      console.error("Decrypt error:", err);
      notify?.("⚠ Decryption cancelled or failed");
    }
  }

  // ➕ Add expense (encrypted)
  async function addExpense(
    category: string,
    amount: number,
    notify?: (msg: string) => void
  ) {
    if (!ensureReady(notify) || amount <= 0) return;

    try {
      const contract = await getContract();
      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      const encrypted = await createEncryptedInput(
        EXPENSE_TRACKER_ADDRESS,
        address!,
        amount
      );

      await (
        await contract.addExpense(
          CATEGORIES.indexOf(category),
          timestamp,
          encrypted.encryptedData,
          encrypted.proof
        )
      ).wait();

      notify?.(`📝 Expense added: ${category}`);
      setDecryptedTotal(null); // force re-decrypt for fresh total
      loadExpenses();
    } catch (err: any) {
      console.error("Add expense failed:", err);
      notify?.(`❌ Add failed: ${err.message ?? "Unknown error"}`);
    }
  }

  // 🗑 Delete expense
  async function deleteExpense(
    onchainIndex: number,
    notify?: (msg: string) => void
  ) {
    if (!ensureReady(notify)) return;

    try {
      const contract = await getContract();
      await (await contract.deleteExpense(onchainIndex)).wait();

      notify?.("🗑️ Deleted");
      setDecryptedTotal(null);
      loadExpenses();
    } catch (err: any) {
      console.error("Delete failed:", err);
      notify?.(`❌ Delete failed: ${err.message ?? "Unknown error"}`);
    }
  }

  return { expenses, decryptedTotal, addExpense, deleteExpense, decryptTotal };
}
