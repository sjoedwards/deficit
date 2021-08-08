import { testClient } from "./../utils/test-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import deficitHandler from "../../pages/api/deficit";
import { createMockJWT } from "./../utils/create-mock-jwt";
import { calorieMock } from "../pages/api/api-data/calories/mock-default-calorie-data";
import { weightMock } from "../pages/api/api-data/weight/mock-default-weight-data";
import { authMock } from "../pages/api/api-data/auth/mock-default-auth-mock";

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
  realDateNow = Date.now.bind(global.Date);
  // stub date to 1 June 2021 22:57:05
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
});

afterEach(() => {
  calMockservice.get().resetHistory();
  global.Date.now = realDateNow;
});
describe("setTokenFromCookie", () => {
  test("adds access & refresh tokens if call to refresh succeeds", async () => {
    const client = await testClient(deficitHandler);
    const response = await client
      .get("/api/")
      .set("Cookie", `refreshToken=${createMockJWT()}`);
    expect(response.header["set-cookie"][0]).toMatch(/accessToken=.+/);
    expect(response.status).toBe(200);
  });

  test("removes refresh token if call to refresh fails", async () => {
    authMockService.mockFailure();
    const client = await testClient(deficitHandler);
    const response = await client
      .get("/api/")
      .set("Cookie", `refreshToken=${createMockJWT()}`);
    expect(response.header["set-cookie"][0]).toMatch("refreshToken=;");
    expect(response.status).toBe(401);
  });
});