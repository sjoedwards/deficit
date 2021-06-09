import request from "supertest";
import { app } from "../../app";
import { weightMock } from "../api-data/weight/mock-default-weight-data";
import { weeklyWeightExpectedResponse } from "../expected-responses/weight/weekly";
import { createMockJWT } from "../tools/create-mock-jwt";

let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
});

afterEach(() => {
  global.Date.now = realDateNow;
});

// This sets the mock adapter on the default instance
beforeEach(() => {
  weightMock().mockDefault();
});

describe("weight Route", () => {
  it("should return the correct weight information for a weekly resolution", async () => {
    const weeklyResponse = await request(app.callback())
      .get("/weight")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
    expect(weeklyResponse.body).toEqual(weeklyWeightExpectedResponse);
  });

  // it("should return the correct weight information for a daily resolution", async () => {
  //   const dailyResponse = await request(app.callback())
  //     .get("/calories/daily")
  //     .set("Cookie", `accessToken=${createMockJWT()}`)
  //     .send()
  //     .expect(200);
  //   expect(dailyResponse.body).toEqual(dailyWeightExpectedResponse);
  // });
});
