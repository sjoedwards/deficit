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
});
const config = getConfig();

// const Profile = () => {
//   if (error) return <div>failed to load</div>;
//   if (!data) return <div>loading...</div>;
//   return <div>hello {data.averageDeficitCurrentMonth}!</div>;
// };

export default function Home() {
  const redirectUri = encodeURI(
    process.env.NEXT_REDIRECT_URI || "http://localhost:3000"
  );
  useEffect(() => {
    const getDeficit = async () => {
      try {
        const response = await axios.get(config.urls.deficit, {
          maxRedirects: 0,
        });
      } catch (e) {
        if (e.response.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_FITBIT_CLIENT_ID}&scope=activity%20nutrition%20weight&redirect_uri=${redirectUri}`
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
