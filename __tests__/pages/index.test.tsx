import React from "react";
import Home from "../../pages/index";
import { act, render, screen, within } from "@testing-library/react";
import { FitbitProvider } from "../../src/contexts/useFitbit";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { calorieMock } from "./api/mocks/frontend/calories/calories-mock";
import { weightMock } from "./api/mocks/frontend/weight/weight-mock";

const mock = new MockAdapter(axios);
const calMockservice = calorieMock(mock);
const weightMockService = weightMock(mock);
const { findByRole, queryByText, getByText, getByTestId } = screen;

// This sets the mock adapter on the default instance
beforeEach(async () => {
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(1622588225000));
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  calMockservice.get().resetHistory();
});

const customRender = () => render(<Home />, { wrapper: FitbitProvider });

describe("Home Page", () => {
  it("Renders Deficit after initial load", async () => {
    customRender();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    await findByRole("heading", { name: /current month/i });
    // Monthly
    getByText(/your deficit today is \-1095/i);
    getByText(
      /you have an average daily deficit of \-1095 calories \(averaged over days this month\)/i
    );
    getByText(
      /you are predicted to lose 0\.044 kilograms per week, based off of your historic metabolic data\./i
    );
    getByText(
      /you need a deficit of \-1726 for the rest of the days this month to lose your goal of 0\.25 kilos/i
    );

    //Quarterly
    getByText(
      /you have an average daily deficit of \-710 calories \(averaged over days this quarter\)/i
    );
    getByText(
      /you are predicted to gain 0\.086 kilograms per week, based off of your historic metabolic data\./i
    );
    getByText(
      /you need a deficit of \-3773 for the rest of the days this quarter to lose your goal of 0\.25 kilos/i
    );

    getByText(/Annual Loss Prediction Engine For Monthly Deficit \(kg\)/i);
    const monthlyLossPrediction = getByTestId("loss-prediction-monthly");
    within(monthlyLossPrediction).getByText(/Per Week/i);
    within(monthlyLossPrediction).getByText(/-0.037/i);
    within(monthlyLossPrediction).getByText(/Per Month/i);
    within(monthlyLossPrediction).getByText(/-0.160/i);
    within(monthlyLossPrediction).getByText(/Per Year/i);
    within(monthlyLossPrediction).getByText(/-1.921/i);

    getByText(/Annual Loss Prediction Engine For Quarterly Deficit \(kg\)/i);
    const quarterlyLossPrediction = getByTestId("loss-prediction-quarterly");
    within(quarterlyLossPrediction).getByText(/Per Week/i);
    within(quarterlyLossPrediction).getByText(/-0.024/i);
    within(quarterlyLossPrediction).getByText(/Per Month/i);
    within(quarterlyLossPrediction).getByText(/-0.104/i);
    within(quarterlyLossPrediction).getByText(/Per Year/i);
    within(quarterlyLossPrediction).getByText(/-1.245/i);

    findByRole("heading", { name: /Weekly Calories/i });
    const weeklyCalories = getByTestId("weekly-calories");
    within(weeklyCalories).getByText(
      "Since last Friday, your average calorie intake is 3975 per day"
    );

    within(weeklyCalories).getByText(
      "You need -1100 calories for the remaining days this week to hit your target of 1800 calories per day"
    );

    within(quarterlyLossPrediction).getByText(/Per Week/i);
    within(quarterlyLossPrediction).getByText(/-0.024/i);

    expect(queryByText("Loading...")).not.toBeInTheDocument();
  });
});
