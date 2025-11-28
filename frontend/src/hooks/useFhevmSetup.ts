import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { initializeFheInstance, getFheInstance } from "../lib/fhevm";

export default function useFhevmSetup() {
 const { isConnected } = useAccount();
 const chainId = useChainId();

 const [isInitialized, setInitialized] = useState(false);
 const [isInitializing, setInitializing] = useState(false);

 useEffect(() => {
 if (!isConnected || chainId !== 11155111 || isInitialized) return;

 if (!(window as any).RelayerSDK && !(window as any).relayerSDK) {
 console.warn(" Relayer SDK not yet loaded…");
 return;
 }

 console.log(" Initializing FHEVM…");
 setInitializing(true);

 initializeFheInstance()
 .then(() => {
 if (getFheInstance()) {
 console.log(" FHEVM Ready!");
 setInitialized(true);
 } else {
 console.error(" FHEVM returned null instance!");
 }
 })
 .catch((err) => {
 console.error(" Failed to initialize FHEVM:", err);
 })
 .finally(() => setInitializing(false));
 }, [isConnected, chainId]);

 return { isInitialized, isInitializing };
}