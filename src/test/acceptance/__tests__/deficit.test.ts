import request from "supertest";
import { app } from "../../../app";
import { calorieMock } from "../api-data/calories/mock-default-calorie-data";
import { weightMock } from "../api-data/weight/mock-default-weight-data";
import { deficitExpectedResponse } from "../expected-responses/deficit";
import { createMockJWT } from "../tools/create-mock-jwt";

let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
});
const calMockservice = calorieMock();
const weightMockService = weightMock(calMockservice.get());
// This sets the mock adapter on the default instance
beforeEach(() => {
  calMockservice.mockDefault();
  weightMockService.mockDefault();
});

afterEach(() => {
  calMockservice.get().resetHistory();
  global.Date.now = realDateNow;
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
