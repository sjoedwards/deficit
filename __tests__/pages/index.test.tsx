import React from "react";
import Home from "../../pages/index";
import { act, render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { calorieMock } from "./api/mocks/frontend/calories/calories-mock";
import { weightMock } from "./api/mocks/frontend/weight/weight-mock";

const mock = new MockAdapter(axios);
const calMockservice = calorieMock(mock);
const weightMockService = weightMock(mock);
const { findByRole, queryByText, getByText } = screen;

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

describe("Home Page", () => {
  it("Renders Deficit after initial load", async () => {
    render(<Home />);
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

    expect(queryByText("Loading...")).not.toBeInTheDocument();
  });
});
