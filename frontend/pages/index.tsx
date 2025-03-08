
import type { NextPage } from "next";
import Head from "next/head";
import { useWallet } from "../src/providers/WalletProvider";
import LandingPage from "../components/LandingPage";
import Sidebar from "../components/Sidebar";

const Home: NextPage = () => {
  const { isConnected } = useWallet();

  return (
    <div>
      <Head>
        <title>Monniverse Lagoon</title>
        <meta name="description" content="A Web3 decentralized platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <LandingPage />
      </div>
    </div>
  );
};

export default Home;
