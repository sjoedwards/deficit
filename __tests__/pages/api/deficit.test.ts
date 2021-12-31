import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import deficitHandler from "../../../pages/api/deficit";
import { testClient } from "../../utils/test-client";
import { createMockJWT } from "../../utils/create-mock-jwt";
import { deficitExpectedResponse } from "../../expected-responses/deficit";
import { calorieMock } from "./api-data/calories/mock-default-calorie-data";
import { weightMock } from "./api-data/weight/mock-default-weight-data";
import { authMock } from "./api-data/auth/mock-default-auth-mock";

let realDateNow: () => number;
const mock = new MockAdapter(axios);
const calMockservice = calorieMock(mock);
const weightMockService = weightMock(mock);
const authMockService = authMock(mock);
mock.onAny(new RegExp("/api/")).passThrough();

// This sets the mock adapter on the default instance
beforeEach(() => {
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  authMockService.mockDefault();
  // stub date to 1 June 2021 22:57:05
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(1622588225000));
});
afterEach(() => {
  calMockservice.get().resetHistory();
  jest.useRealTimers();
});

describe("Deficit handler", () => {
  it("should return the correct deficit information for a weekly resolution", async () => {
    const client = await testClient(deficitHandler);

    const response = await client
      .get("/deficit")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(deficitExpectedResponse);
  });
});
