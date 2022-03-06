import React from "react";
import Home from "../../pages/index";
import { render } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { calorieMock } from "./api/mocks/frontend/calories/calories-mock";
import { weightMock } from "./api/mocks/frontend/weight/weight-mock";

const mock = new MockAdapter(axios);
const calMockservice = calorieMock(mock);
const weightMockService = weightMock(mock);

// This sets the mock adapter on the default instance

beforeEach(async () => {
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  //   // stub date to 1 June 2021 22:57:05
});

afterEach(() => {
  calMockservice.get().resetHistory();
});

describe("Home Page", () => {
  it("Renders Deficit after initial load", async () => {
    const { findByRole, queryByText } = render(<Home />);

    await findByRole("heading", { name: /current month/i });
    //continue here...
    expect(queryByText("Loading...")).not.toBeInTheDocument();
  });
});
