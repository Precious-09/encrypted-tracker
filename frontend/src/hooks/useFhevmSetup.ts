// @ts-ignore

import { useEffect } from "react";
import { useFhevm } from "../../fhevm-sdk/dist/index.js";
import { useAccount, useChainId } from "wagmi";

export default function useFhevmSetup() {
  const { isInitialized, initialize } = useFhevm();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    if (!isConnected) return;
    if (chainId !== 11155111) {
      console.warn("⚠ Switch to Sepolia testnet before initializing FHEVM.");
      return;
    }
    if (!isInitialized) {
      if ((window as any).RelayerSDK || (window as any).relayerSDK) {
        console.log("Initializing FHEVM after wallet and network ready…");
        initialize(); 
      } else {
        console.error("❌ Missing Relayer SDK in index.html");
      }
    }
  }, [isConnected, chainId, isInitialized, initialize]);

  return { isInitialized };
}
