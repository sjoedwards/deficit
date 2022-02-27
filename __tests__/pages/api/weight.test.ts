import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import weightHandler from "../../../pages/api/weight/[resolution]";
import { testClient } from "../../utils/test-client";
import { createMockJWT } from "../../utils/create-mock-jwt";
import { calorieMock } from "./api-data/calories/mock-default-calorie-data";
import { weightMock } from "./api-data/weight/mock-default-weight-data";
import { authMock } from "./api-data/auth/mock-default-auth-mock";
import supertest from "supertest";
import { monthlyWeightExpectedResponse } from "../../expected-responses/weight/monthly";
import { weeklyWeightExpectedResponse } from "../../expected-responses/weight/weekly";
import { dailyWeightExpectedResponse } from "../../expected-responses/weight/daily";

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
  jest.useFakeTimers("modern");
  jest.setSystemTime(new Date(1622588225000));
  client = await testClient(weightHandler);
});

afterEach(() => {
  calMockservice.get().resetHistory();
  jest.useRealTimers();
});

describe("Weight Route", () => {
  it("should return 404 if resolution type is not supported", async () => {
    await client
      .get("/api/weight/fortnightly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(400);
  });

  it("should return the correct weight information for a monthly resolution", async () => {
    client = await testClient(weightHandler, { resolution: "monthly" });

    const response = await client
      .get("/api/weight/monthly")
      .query({ resolution: "monthly" })
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(monthlyWeightExpectedResponse);
  });

  it("should return the correct weight information for a weekly resolution", async () => {
    client = await testClient(weightHandler, { resolution: "weekly" });

    const response = await client
      .get("/api/weight/weekly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(weeklyWeightExpectedResponse);
  });

  it("should return the correct weight information for a daily resolution", async () => {
    client = await testClient(weightHandler, { resolution: "daily" });

    const response = await client
      .get("/api/weight/daily")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(dailyWeightExpectedResponse);
  });
});
