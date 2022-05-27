import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { ReactElement, useEffect } from "react";
import axios from "axios";
import Router from "next/router";
import { logError } from "../tools/log-error";
import {
  DeficitProvider,
  getInitialData,
  useDeficit,
} from "../src/contexts/useDeficit";

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

function Home(): ReactElement {
  const { state, dispatch } = useDeficit();

  useEffect(() => {
    const getDeficit = async () => {
      if (state.error) {
        if (
          axios.isAxiosError(state.error) &&
          state.error.response?.status === 401
        ) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        } else {
          logError(`${state.error}`);
        }
      } else if (!state.deficit) {
        await getInitialData(dispatch);
      }
    };
    getDeficit();
  }, [dispatch, state.error, state.calories, state.weight]);

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Deficit</title>
          <meta name="description" content="deficit" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Deficit info:</h1>
          {state.error && <p>Theres been an error!</p>}
          {!state.deficit?.averageDeficitCurrentMonth ? (
            <p>Loading...</p>
          ) : (
            <>
              <div>
                <p>
                  Your deficit today is{" "}
                  {
                    state.deficit?.deficits[state.deficit?.deficits?.length - 1]
                      ?.deficit
                  }
                </p>
              </div>
              <div>
                <h2>Current Month</h2>
              </div>
              <div>
                <p>
                  You have an average daily deficit of{" "}
                  {state.deficit?.averageDeficitCurrentMonth} calories (averaged
                  over days this month)
                </p>
              </div>
              <div>
                <p>
                  You are predicted to{" "}
                  {parseFloat(
                    state.deficit?.predictedWeeklyWeightDiff.noMovingAverage
                      .weightDiffKilos || ""
                  ) >= 0
                    ? "gain"
                    : "lose"}{" "}
                  {Math.abs(
                    parseFloat(
                      state.deficit?.predictedWeeklyWeightDiff.noMovingAverage
                        .weightDiffKilos || ""
                    )
                  )}{" "}
                  kilograms per week, based off of your historic metabolic data.
                </p>
              </div>
              <div>
                <p>
                  You need a deficit of{" "}
                  {
                    state.deficit?.predictedWeeklyWeightDiff.noMovingAverage
                      .deficitForRemainingDaysThisMonth
                  }{" "}
                  for the rest of the days this month to lose your goal of 0.25
                  kilos
                </p>
              </div>
              {/* TODO This needs testing */}
              <div>
                <p>
                  <b>Annual Loss Prediction Engine For Monthly Deficit (kg)</b>
                </p>
                {/* TODO this needs to be made into a component */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <table>
                    <thead>
                      <tr>
                        <td>
                          <p>Per Week</p>
                        </td>
                        <td>
                          {state.deficit.annualEngine.prediction.currentMonth.perWeek.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <p>Per Month</p>
                        </td>
                        <td>
                          <p>
                            {state.deficit.annualEngine.prediction.currentMonth.perMonth.toFixed(
                              2
                            )}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p>Per Year</p>
                        </td>
                        <td>
                          <p>
                            {state.deficit.annualEngine.prediction.currentMonth.perYear.toFixed(
                              2
                            )}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2>Current Quarter</h2>
              </div>

              <div>
                <p>
                  You have an average daily deficit of{" "}
                  {state.deficit?.currentQuarter.averageDeficitCurrentQuarter}{" "}
                  calories (averaged over days this quarter)
                </p>
              </div>
              <div>
                <p>
                  You are predicted to{" "}
                  {parseFloat(
                    state.deficit?.currentQuarter.predictedWeeklyWeightDiff
                      .noMovingAverage.weightDiffKilos || ""
                  ) >= 0
                    ? "gain"
                    : "lose"}{" "}
                  {Math.abs(
                    parseFloat(
                      state.deficit?.currentQuarter.predictedWeeklyWeightDiff
                        .noMovingAverage.weightDiffKilos || ""
                    )
                  )}{" "}
                  kilograms per week, based off of your historic metabolic data.
                </p>
              </div>
              <div>
                <p>
                  You need a deficit of{" "}
                  {
                    state.deficit?.currentQuarter.predictedWeeklyWeightDiff
                      .noMovingAverage.deficitForRemainingDaysThisQuarter
                  }{" "}
                  for the rest of the days this quarter to lose your goal of
                  0.25 kilos
                </p>
              </div>

              <div>
                <p>
                  <b>
                    Annual Loss Prediction Engine For Quarterly Deficit (kg)
                  </b>
                </p>
                {/* TODO this needs to be made into a component */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <table>
                    <thead>
                      <tr>
                        <td>
                          <p>Per Week</p>
                        </td>
                        <td>
                          {state.deficit.annualEngine.prediction.currentQuarter.perWeek.toFixed(
                            2
                          )}
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <p>Per Month</p>
                        </td>
                        <td>
                          <p>
                            {state.deficit.annualEngine.prediction.currentQuarter.perMonth.toFixed(
                              2
                            )}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p>Per Year</p>
                        </td>
                        <td>
                          <p>
                            {state.deficit.annualEngine.prediction.currentQuarter.perYear.toFixed(
                              2
                            )}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default function HomeWrapper(): ReactElement {
  return (
    <DeficitProvider>
      <Home />
    </DeficitProvider>
  );
}
