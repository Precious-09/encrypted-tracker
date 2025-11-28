import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { initializeFheInstance, getFheInstance } from "../lib/fhevm";

export default function useFhevmSetup() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [isInitialized, setInitialized] = useState(false);
  const [isInitializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!isConnected || chainId !== 11155111 || isInitialized || isInitializing) return;

    async function loadAndInit() {
      try {
        setInitializing(true);

        // 🔥 Load SDK dynamically if missing
        if (!(window as any).RelayerSDK && !(window as any).relayerSDK) {
          console.warn("⚠️ Relayer SDK not found – loading dynamically...");
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs";
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Relayer SDK"));
            document.body.appendChild(script);
          });
        }

        console.log("🚀 Initializing FHEVM...");
        await initializeFheInstance();

        if (getFheInstance()) {
          console.log("🔐 FHEVM initialized!");
          setInitialized(true);
        } else {
          console.error("❌ Initialization returned null instance");
        }
      } catch (err) {
        console.error("❌ Failed to initialize FHEVM:", err);
      } finally {
        setInitializing(false);
      }
    }

    loadAndInit();
  }, [isConnected, chainId, isInitialized, isInitializing]);

  return { isInitialized, isInitializing };
}
