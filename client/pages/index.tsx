import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Deficit</title>
        <meta name="description" content="deficit" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Hello world!</h1>
      </main>
    </div>
  );
}
