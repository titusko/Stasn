
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ConnectButton from "../src/components/wallet/ConnectButton";
import { useWallet } from "../src/contexts/WalletContext";

const Home: NextPage = () => {
  const { isConnected } = useWallet();

  return (
    <div className={styles.container}>
      <Head>
        <title>Web3 Task Platform</title>
        <meta name="description" content="A decentralized task platform powered by Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Web3 Task Platform</h1>

        <p className={styles.description}>
          A decentralized platform for creating and completing tasks
        </p>

        <div className="mt-8">
          <ConnectButton />
        </div>

        {isConnected && (
          <div className={styles.grid + " mt-8"}>
            <a href="#" className={styles.card}>
              <h2>Create Task &rarr;</h2>
              <p>Create a new task and set a reward in tokens.</p>
            </a>

            <a href="#" className={styles.card}>
              <h2>Available Tasks &rarr;</h2>
              <p>Browse tasks that are available for completion.</p>
            </a>

            <a href="#" className={styles.card}>
              <h2>My Tasks &rarr;</h2>
              <p>View tasks you've created or are working on.</p>
            </a>

            <a href="#" className={styles.card}>
              <h2>Profile &rarr;</h2>
              <p>View and manage your profile and earnings.</p>
            </a>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Powered by Web3 Technology
        </a>
      </footer>
    </div>
  );
};

export default Home;
