import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useWallet } from "../src/providers/WalletProvider";
import { useWeb3 } from "../src/providers/Web3Provider";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const { address, connect, disconnect, isConnected } = useWallet();
  const { contract, error: web3Error } = useWeb3();
  const [balance, setBalance] = useState<string>("0");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (!contract || !address) {
        setBalance("0");
        return;
      }

      try {
        setError("");
        const balance = await contract.balanceOf(address);
        setBalance(ethers.formatEther(balance));
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch balance");
        setBalance("0");
      }
    };

    fetchBalance();
  }, [contract, address]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Web3 Token App</title>
        <meta name="description" content="A Web3 token application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Web3 Token App</h1>

        <div className={styles.connect}>
          {!isConnected ? (
            <button onClick={connect} className={styles.button}>
              Connect Wallet
            </button>
          ) : (
            <div>
              <p>Connected: {address}</p>
              <p>Contract Address: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</p>
              <p>Balance: {balance} MTK</p>
              {(error || web3Error) && (
                <p style={{ color: 'red' }}>
                  Error: {error || web3Error}
                </p>
              )}
              <button onClick={disconnect} className={styles.button}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
