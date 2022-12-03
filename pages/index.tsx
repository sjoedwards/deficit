import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { ReactElement, useEffect } from "react";
import axios from "axios";
import Router from "next/router";
import { logError } from "../tools/log-error";
import { DeficitProvider, useDeficit } from "../src/contexts/useDeficit";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";

import {
  useWeeklyCaloriesRemaining,
  WeeklyCaloriesRemainingProvider,
  getInitialData as getIntialWeeklyCaloriesRemainingData,
} from "../src/contexts/useWeeklyCaloriesRemaining";
import { CaloriesProvider, useCalories } from "../src/contexts/useCalories";
import { useWeight, WeightProvider } from "../src/contexts/useWeight";

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
  const goal = 2000;
  const { state: caloriesState } = useCalories();
  const { state: weightState } = useWeight();
  const { state, dispatch } = useDeficit();
  const { daily: dailyCalories, weekly: weeklyCalories } = caloriesState;
  const { weekly: weeklyWeight } = weightState;

  const {
    state: weeklyCaloriesRemainingState,
    dispatch: dispatchWeeklyCaloriesRemaining,
  } = useWeeklyCaloriesRemaining();

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
      }
    };

    const getWeeklyCaloriesRemaining = async () => {
      if (weeklyCaloriesRemainingState.error) {
        if (
          axios.isAxiosError(weeklyCaloriesRemainingState.error) &&
          weeklyCaloriesRemainingState.error.response?.status === 401
        ) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        } else {
          logError(`${weeklyCaloriesRemainingState.error}`);
        }
      } else if (!weeklyCaloriesRemainingState.averageCaloriesThisWeek) {
        await getIntialWeeklyCaloriesRemainingData(
          dispatchWeeklyCaloriesRemaining,
          goal
        );
      }
    };
    getDeficit();
    getWeeklyCaloriesRemaining();
  }, [
    dispatch,
    dispatchWeeklyCaloriesRemaining,
    state.error,
    dailyCalories,
    state.weight,
    state.deficit,
    weeklyCaloriesRemainingState,
  ]);

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
              <h2>Metrics for last week</h2>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell variant="head">Calories</TableCell>
                      <TableCell>Activity Calories</TableCell>
                      <TableCell>Weight</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {weeklyCalories?.[weeklyCalories.length - 1].calories}
                      </TableCell>
                      <TableCell>
                        {
                          weeklyCalories?.[weeklyCalories.length - 1]
                            .activityCalories
                        }
                      </TableCell>
                      <TableCell>
                        {weeklyWeight?.[weeklyWeight.length - 1].weight}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <div>
                <h2>Weekly Calories</h2>
              </div>
              {/* TODO this needs to be made into a component */}
              <div data-testid="weekly-calories">
                <div>
                  <p>
                    Today, you have consumed{" "}
                    {dailyCalories?.[dailyCalories.length - 1].calories}{" "}
                    calories
                  </p>
                </div>
                <div>
                  <p>
                    Since last Friday, your average calorie intake is{" "}
                    {weeklyCaloriesRemainingState.averageCaloriesThisWeek} per
                    day
                  </p>
                </div>
                <div>
                  <p>
                    You need{" "}
                    {weeklyCaloriesRemainingState.caloriesRemainingPerDay}{" "}
                    calories for the remaining days this week to hit your target
                    of {goal} calories per day
                  </p>
                </div>
              </div>
              <div>
                <h2>Deficit today</h2>
              </div>
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
                <div
                  data-testid="loss-prediction-monthly"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <table>
                    <thead>
                      <tr>
                        <td>
                          <p>Per Week</p>
                        </td>
                        <td>
                          {state.deficit.annualEngine.prediction.currentMonth.perWeek.toFixed(
                            3
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
                              3
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
                              3
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
                <div
                  data-testid="loss-prediction-quarterly"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <table>
                    <thead>
                      <tr>
                        <td>
                          <p>Per Week</p>
                        </td>
                        <td>
                          {state.deficit.annualEngine.prediction.currentQuarter.perWeek.toFixed(
                            3
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
                              3
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
                              3
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
    <WeeklyCaloriesRemainingProvider>
      <CaloriesProvider>
        <WeightProvider>
          <DeficitProvider>
            <Home />
          </DeficitProvider>
        </WeightProvider>
      </CaloriesProvider>
    </WeeklyCaloriesRemainingProvider>
  );
}
