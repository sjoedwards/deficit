import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import request from "supertest";
import { app } from "../../app";
import { caloriesApiData } from "../api-data/calories";
import { deficitExpectedResponse } from "../expected-responses/deficit";
import { createMockJWT } from "../tools/create-mock-jwt";

let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to Wednesday, 2 June 2021 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622635200000);
});

afterEach(() => {
  global.Date.now = realDateNow;
});

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios);
beforeEach(() => {
  const urlCalsInMonthly = new RegExp(
    "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/3m.json"
  );
  const urlActivitiesCalsMonthly = new RegExp(
    "https://api.fitbit.com/1/user/-/activities/calories/date/today/3m.json"
  );
  mock.onGet(urlCalsInMonthly).reply(200, {
    "foods-log-caloriesIn": caloriesApiData["foods-log-caloriesIn"],
  });
  mock.onGet(urlActivitiesCalsMonthly).reply(200, {
    "activities-calories": caloriesApiData["activities-calories"],
  });

  const fitbitApiCalories = new RegExp(
    "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/"
  );
  const fitbitApiActivities = new RegExp(
    "https://api.fitbit.com/1/user/-/activities/"
  );
  mock.onGet(fitbitApiCalories).reply(500);
  mock.onGet(fitbitApiActivities).reply(500);
});

describe("Deficit Route", () => {
  it("should return the correct deficit information for a weekly resolution", async () => {
    const response = await request(app.callback())
      .get("/deficit")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(response.body).toEqual(deficitExpectedResponse);
  });
});
