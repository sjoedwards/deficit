import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import caloriesHandler from "../../../pages/api/calories/[resolution]";
import { testClient } from "../../utils/test-client";
import { createMockJWT } from "../../utils/create-mock-jwt";
import { calorieMock } from "./api-data/calories/mock-default-calorie-data";
import { weightMock } from "./api-data/weight/mock-default-weight-data";
import { authMock } from "./api-data/auth/mock-default-auth-mock";
import supertest from "supertest";
import { monthlyCaloriesExpectedResponse } from "../../expected-responses/calories/monthly";
import { weeklyCaloriesExpectedResponse } from "../../expected-responses/calories/weekly";
import { dailyCaloriesExpectedResponse } from "../../expected-responses/calories/daily";

let realDateNow: () => number;
const mock = new MockAdapter(axios);
const calMockservice = calorieMock(mock);
const weightMockService = weightMock(mock);
const authMockService = authMock(mock);
mock.onAny(new RegExp("/api/")).passThrough();

// This sets the mock adapter on the default instance

let client: supertest.SuperTest<supertest.Test>;
beforeEach(async () => {
  calMockservice.mockDefault();
  weightMockService.mockDefault();
  authMockService.mockDefault();
  realDateNow = Date.now.bind(global.Date);
  // stub date to 1 June 2021 22:57:05
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  client = await testClient(caloriesHandler);
});

afterEach(() => {
  calMockservice.get().resetHistory();
  global.Date.now = realDateNow;
});

describe("Weight Route", () => {
  it("should return 404 if resolution type is not supported", async () => {
    await client
      .get("/calories/fortnightly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(400);
  });
  it("should return the correct calorie information for a monthly resolution", async () => {
    client = await testClient(caloriesHandler, { resolution: "monthly" });

    const response = await client
      .get("/calories/monthly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(monthlyCaloriesExpectedResponse);
  });
  it("should return the correct calorie information for a weekly resolution", async () => {
    client = await testClient(caloriesHandler, { resolution: "weekly" });

    const response = await client
      .get("/calories/weekly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(weeklyCaloriesExpectedResponse);
  });

  it("should return the correct calorie information for a daily resolution", async () => {
    client = await testClient(caloriesHandler, { resolution: "daily" });

    const response = await client
      .get("/calories/daily")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(dailyCaloriesExpectedResponse);
  });
});
