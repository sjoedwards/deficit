import { testClient } from "./../utils/test-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import weightHandler from "../../pages/api/weight/[resolution]";
import { createMockJWT } from "./../utils/create-mock-jwt";
import { calorieMock } from "../pages/api/mocks/backend/calories/mock-default-calorie-data";
import { weightMock } from "../pages/api/mocks/backend/weight/mock-default-weight-data";
import { authMock } from "../pages/api/mocks/backend/auth/mock-default-auth-mock";
import { logError } from "../../tools/log-error";

jest.mock("../../tools/log-error");

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
  jest.resetAllMocks();
});
describe("setTokenFromCookie", () => {
  test("adds access & refresh tokens if call to refresh succeeds", async () => {
    const client = await testClient(weightHandler, { resolution: "daily" });
    const response = await client
      .get("/api/")
      .set("Cookie", `refreshToken=${createMockJWT()}`);
    expect(response.header["set-cookie"][0]).toMatch(/accessToken=.+/);
    expect(response.status).toBe(200);
  });

  test("removes refresh token if call to refresh fails", async () => {
    authMockService.mockFailure();
    const client = await testClient(weightHandler);
    const response = await client
      .get("/api/")
      .set("Cookie", `refreshToken=${createMockJWT()}`);
    expect(response.header["set-cookie"][0]).toMatch("refreshToken=;");
    expect(response.status).toBe(401);
  });

  test("logs the exception if call to refresh fails", async () => {
    authMockService.mockFailure();
    const client = await testClient(weightHandler);
    await client.get("/api/").set("Cookie", `refreshToken=${createMockJWT()}`);
    expect(logError).toHaveBeenCalledWith(
      `Call to fitbit token endpoint failed: [{\"errorType\":\"invalid_client\",\"message\":\"Refresh Token Error\"}]`
    );
  });
});
