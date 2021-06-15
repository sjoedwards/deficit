import request from "supertest";
import { app } from "../../../app";
import { calorieMock } from "../api-data/calories/mock-default-calorie-data";
import { dailyCaloriesExpectedResponse } from "../expected-responses/calories/daily";
import { monthlyCaloriesExpectedResponse } from "../expected-responses/calories/monthly";
import { weeklyCaloriesExpectedResponse } from "../expected-responses/calories/weekly";
import { createMockJWT } from "../../tools/create-mock-jwt";

let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 1 June 2021 22:57:05
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
});

afterEach(() => {
  global.Date.now = realDateNow;
});

// This sets the mock adapter on the default instance
beforeEach(() => {
  calorieMock().mockDefault();
});

describe("Calories Route", () => {
  it("should return 404 if resolution type is not supported", async () => {
    await request(app.callback())
      .get("/calories/fortnightly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(400);
  });
  it("should return the correct calorie information for a monthly resolution", async () => {
    const monthlyResponse = await request(app.callback())
      .get("/calories/monthly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    // Start here - populating responses
    console.log(monthlyResponse.body);
    expect(monthlyResponse.body).toEqual(monthlyCaloriesExpectedResponse);
  });
  it("should return the correct calorie information for a weekly resolution", async () => {
    const weeklyResponse = await request(app.callback())
      .get("/calories/weekly")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(weeklyResponse.body).toEqual(weeklyCaloriesExpectedResponse);
  });

  it("should return the correct calorie information for a daily resolution", async () => {
    const dailyResponse = await request(app.callback())
      .get("/calories/daily")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(dailyResponse.body).toEqual(dailyCaloriesExpectedResponse);
  });
});
