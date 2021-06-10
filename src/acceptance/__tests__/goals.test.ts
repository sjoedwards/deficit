import { calorieMock } from "../api-data/calories/mock-default-calorie-data";
import { weightMock } from "../api-data/weight/mock-default-weight-data";
import request from "supertest";
import { app } from "../../app";
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

describe("Goals Route", () => {
  it("returns the goals for the currently logged in user", async () => {
    const goalsResponse = await request(app.callback())
      .get("/goals")
      .set("Cookie", `accessToken=${createMockJWT()}`)
      .send()
      .expect(200);
  });
});
