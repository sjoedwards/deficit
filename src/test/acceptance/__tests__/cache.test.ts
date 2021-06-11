import { calorieMock } from "../api-data/calories/mock-default-calorie-data";
import { weightMock } from "../api-data/weight/mock-default-weight-data";
import request from "supertest";
import { app } from "../../../app";
import { cache } from "../../../cache";
import { createMockJWT } from "../../tools/create-mock-jwt";

const getWeeklyResponse = async ({
  route,
  subject,
}: {
  route?: string;
  subject?: string;
} = {}) =>
  await request(app.callback())
    .get(`/${route}/weekly`)
    .set("Cookie", `accessToken=${createMockJWT(subject)}`)
    .send();

let cacheSpySet: jest.SpyInstance;
let cacheSpyGet: jest.SpyInstance;
let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 1 June 2021 22:57:05
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  cacheSpySet = jest.spyOn(cache, "set");
  cacheSpyGet = jest.spyOn(cache, "get");
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
  cacheSpySet.mockClear();
  cacheSpyGet.mockClear();
  cache.getInstance().flushAll();
});
describe.each([
  ["calories", 2, 1, 1],
  ["weight", 3, 1, 1],
])("Caching for %s route", (route, apiCalls, cacheGetCalls, cacheSetCalls) => {
  it("should return cached data if request made a second time for the same user", async () => {
    const response1 = await getWeeklyResponse({ route });
    expect(response1.status).toEqual(200);
    expect(calMockservice.get().history.get).toHaveLength(apiCalls);
    expect(cacheSpySet).toHaveBeenCalledTimes(cacheSetCalls);
    expect(cacheSpySet).toHaveLastReturnedWith(`${route}-subject1`);
    expect(cacheSpyGet).toHaveBeenCalledTimes(1);

    const response2 = await getWeeklyResponse({ route });
    expect(response2.status).toEqual(200);
    expect(calMockservice.get().history.get).toHaveLength(apiCalls);
    expect(cacheSpySet).toHaveBeenCalledTimes(1);
    expect(cacheSpySet).toHaveLastReturnedWith(`${route}-subject1`);
    expect(cacheSpyGet).toHaveBeenCalledTimes(2);
    expect(cache.getInstance().has(`${route}-subject1`)).toEqual(true);
    expect(cache.getInstance().keys()).toHaveLength(1);
    expect(response1.body).toEqual(response2.body);
  });

  it("should return non cached data if a request made for a second user", async () => {
    const response1 = await getWeeklyResponse({ route });
    expect(response1.status).toEqual(200);
    expect(calMockservice.get().history.get).toHaveLength(apiCalls);
    expect(cacheSpySet).toHaveBeenCalledTimes(cacheSetCalls);
    expect(cacheSpySet).toHaveLastReturnedWith(`${route}-subject1`);
    expect(cacheSpyGet).toHaveBeenCalledTimes(1);

    const response2 = await getWeeklyResponse({ route, subject: "subject2" });
    expect(response2.status).toEqual(200);
    expect(calMockservice.get().history.get).toHaveLength(apiCalls * 2);
    expect(cacheSpySet).toHaveBeenCalledTimes(2);
    expect(cacheSpySet).toHaveLastReturnedWith(`${route}-subject2`);
    expect(cache.getInstance().has(`${route}-subject1`)).toEqual(true);
    expect(cache.getInstance().has(`${route}-subject2`)).toEqual(true);
    expect(cache.getInstance().keys()).toHaveLength(cacheSetCalls * 2);
    expect(cacheSpyGet).toHaveBeenCalledTimes(cacheGetCalls * 2);
  });

  it("should throw an error if the subject is not present in the accessToken", async () => {
    expect((await getWeeklyResponse({ route, subject: "" })).status).toBe(500);
  });
});
