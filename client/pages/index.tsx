import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";

interface IDeficitResponse {
  averageDeficitCurrentMonth: string;
  predictedWeeklyWeightDiff: {
    noMovingAverage: {
      weightDiffKilos: string;
      deficitForRemainingDaysThisMonth: string;
    };
  };
  deficits: IDeficitApiData[];
}

interface IDeficitApiData {
  dateTime: string;
  deficit: string;
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
  const [averageDeficit, setAverageDeficit] = useState("");
  const [deficitRemaining, setAverageDeficitRemaining] = useState("");
  const [weightDiff, setWeightDiff] = useState("");
  const [deficits, setDeficits] = useState<never[] | IDeficitApiData[]>([]);

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
        console.log(response);
        const {
          averageDeficitCurrentMonth,
          predictedWeeklyWeightDiff,
          deficits,
        } = response?.data || {};
        const { weightDiffKilos, deficitForRemainingDaysThisMonth } =
          predictedWeeklyWeightDiff?.noMovingAverage || {};
        setAverageDeficit(averageDeficitCurrentMonth);
        setAverageDeficitRemaining(deficitForRemainingDaysThisMonth);
        setWeightDiff(weightDiffKilos);
        setDeficits(deficits);
      } catch (e) {
        if (e?.response?.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        }
      }
    };
    getDeficit();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Deficit</title>
        <meta name="description" content="deficit" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Deficit info:</h1>
        {!averageDeficit ? (
          <p>Loading...</p>
        ) : (
          <>
            <div>
              <p>
                You have an average daily deficit of {averageDeficit} calories
                (averaged over days this month)
              </p>
            </div>
            <div>
              <p>
                You are predicted to{" "}
                {parseFloat(weightDiff) >= 0 ? "gain" : "lose"}{" "}
                {Math.abs(parseFloat(weightDiff))} kilograms per week, based off
                of your historic metabolic data.
              </p>
            </div>
            <div>
              <p>
                You need a deficit of {deficitRemaining} for the rest of the
                days this month to lose your goal of 0.25 kilos
              </p>
            </div>

            <div>
              <p>
                Your deficit today is{" "}
                {deficits?.[deficits?.length - 1]?.deficit}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
