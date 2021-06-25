import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect } from "react";
import axios from "axios";
import Router from "next/router";

interface IDeficitResponse {
  averageDeficitCurrentMonth: string;
  noMovingAverage: {
    weightDiffKilos: string;
    deficitForRemainingDaysThisMonth: string;
  };
}
const getConfig = () => ({
  urls: {
    deficit: process.env.NEXT_PUBLIC_DEFICIT_URL || "",
  },
  fitbit: {
    clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI,
  },
});
const config = getConfig();

const logError = (errorMessage: string): void => {
  console.error(errorMessage);
};

export default function Home() {
  const redirectUri = encodeURI(
    process.env.NEXT_REDIRECT_URI || "http://localhost:3000"
  );
  useEffect(() => {
    const getDeficit = async () => {
      if (!config?.urls?.deficit) {
        logError("Can't get deficit information, no URL defined");
      }
      try {
        const response = await axios.get<IDeficitResponse>(
          config.urls.deficit,
          {
            maxRedirects: 0,
            withCredentials: true,
          }
        );
      } catch (e) {
        if (e?.response?.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        }
      }
    };
    getDeficit();
  });

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
