import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";
import { logError } from "../tools/log-error";

interface IDeficitResponse {
  averageDeficitCurrentMonth: string;
  predictedWeeklyWeightDiff: {
    noMovingAverage: {
      weightDiffKilos: string;
      deficitForRemainingDaysThisMonth: string;
    };
  };
  deficits: IDeficitApiData[];
  currentQuarter: {
    averageDeficitCurrentQuarter: number;
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        weightDiffKilos: string;
        deficitForRemainingDaysThisQuarter: string;
      };
    };
  };
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

export default function Home(): ReactElement {
  const [averageDeficit, setAverageDeficit] = useState("");
  const [averageDeficitCurrentQuarter, setAverageDeficitCurrentQuarter] =
    useState("");

  const [
    deficitRemainingCurrentQuarter,
    setAverageDeficitRemainingCurrentQuarter,
  ] = useState("");

  const [weightDiffCurrentQuarter, setWeightDiffCurrentQuarter] = useState("");

  const [deficitRemaining, setAverageDeficitRemaining] = useState("");
  const [weightDiff, setWeightDiff] = useState("");
  const [error, setError] = useState(false);
  const [deficits, setDeficits] = useState<never[] | IDeficitApiData[]>([]);

  useEffect(() => {
    const getDeficit = async () => {
      try {
        const response = await axios.get<IDeficitResponse>("/api/deficit", {
          maxRedirects: 0,
          withCredentials: true,
        });
        console.log(response);
        const {
          averageDeficitCurrentMonth,
          predictedWeeklyWeightDiff,
          deficits,
          currentQuarter,
        } = response?.data || {};
        const { weightDiffKilos, deficitForRemainingDaysThisMonth } =
          predictedWeeklyWeightDiff?.noMovingAverage || {};
        setAverageDeficit(averageDeficitCurrentMonth);
        setAverageDeficitRemaining(deficitForRemainingDaysThisMonth);
        setWeightDiff(weightDiffKilos);
        setDeficits(deficits);
        setAverageDeficitCurrentQuarter(
          `${currentQuarter.averageDeficitCurrentQuarter}`
        );
        setAverageDeficitRemainingCurrentQuarter(
          currentQuarter.predictedWeeklyWeightDiff.noMovingAverage
            .deficitForRemainingDaysThisQuarter
        );
        setWeightDiffCurrentQuarter(
          currentQuarter.predictedWeeklyWeightDiff.noMovingAverage
            .weightDiffKilos
        );
      } catch (e) {
        if (e?.response?.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        } else {
          logError(e);
          setError(true);
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
        {error && <p>Theres been an error!</p>}
        {!averageDeficit ? (
          <p>Loading...</p>
        ) : (
          <>
            <div>
              <p>
                Your deficit today is{" "}
                {deficits?.[deficits?.length - 1]?.deficit}
              </p>
            </div>
            <div>
              <h2>Current Month</h2>
            </div>
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
              <h2>Current Quarter</h2>
            </div>

            <div>
              <p>
                You have an average daily deficit of{" "}
                {averageDeficitCurrentQuarter} calories (averaged over days this
                quarter)
              </p>
            </div>
            <div>
              <p>
                You are predicted to{" "}
                {parseFloat(weightDiffCurrentQuarter) >= 0 ? "gain" : "lose"}{" "}
                {Math.abs(parseFloat(weightDiffCurrentQuarter))} kilograms per
                week, based off of your historic metabolic data.
              </p>
            </div>
            <div>
              <p>
                You need a deficit of {deficitRemainingCurrentQuarter} for the
                rest of the days this quarter to lose your goal of 0.25 kilos
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
