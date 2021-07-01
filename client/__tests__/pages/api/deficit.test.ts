import { calorieMock } from "./api-data/calories/mock-default-calorie-data";
import { weightMock } from "./api-data/weight/mock-default-weight-data";
import deficitHandler from "../../../pages/api/deficit";
import { testClient } from "../../utils/test-client";
import { createMockJWT } from "../../utils/create-mock-jwt";
import { deficitExpectedResponse } from "../../expected-responses/deficit";

let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 1 June 2021 22:57:05
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

describe("Deficit handler", () => {
  test.only("responds 401 to unauth'd  GET", async () => {
    const client = await testClient(deficitHandler);
    const response = await client.get("/api/deficit");
    expect(response.status).toBe(401);
  });
});

describe("Deficit Route", () => {
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
