import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { WagmiProvider } from "wagmi";
import {
getDefaultConfig,
RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import "./styles.css";

const config = getDefaultConfig({
appName: "EncryptoTrack",
projectId: "010495e8b318de4c424d213ca68362b5",
chains: [sepolia, mainnet],
transports: {
[sepolia.id]: http(),
[mainnet.id]: http(),
},
ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
<WagmiProvider config={config}>
<QueryClientProvider client={queryClient}>
<RainbowKitProvider>
<BrowserRouter>
<App />
</BrowserRouter>
</RainbowKitProvider>
</QueryClientProvider>
</WagmiProvider>
</React.StrictMode>
);