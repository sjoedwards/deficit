import { calorieMock } from "../api-data/calories/mock-default-calorie-data";
import request from "supertest";
import { app } from "../../app";
import jwt from "jsonwebtoken";
import { cache } from "../../cache";
import { createMockJWT } from "../tools/create-mock-jwt";

const getWeeklyResponse = async (subject?: string) =>
  await request(app.callback())
    .get("/calories/weekly")
    .set("Cookie", `accessToken=${createMockJWT(subject)}`)
    .send();

let cacheSpySet: jest.SpyInstance;
let cacheSpyGet: jest.SpyInstance;
let realDateNow: () => number;
beforeEach(() => {
  realDateNow = Date.now.bind(global.Date);
  // stub date to 2021-05-29, 12:00:00
  global.Date.now = jest.fn().mockReturnValue(1622588225000);
  cacheSpySet = jest.spyOn(cache, "set");
  cacheSpyGet = jest.spyOn(cache, "get");
});

const calMock = calorieMock();
// This sets the mock adapter on the default instance
beforeEach(() => {
  calMock.mockDefault();
});

afterEach(() => {
  calMock.get().resetHistory();
  global.Date.now = realDateNow;
  cacheSpySet.mockClear();
  cacheSpyGet.mockClear();
  cache.getInstance().flushAll();
});

describe("Calories: cache", () => {
  it("should return cached data if request made a second time for the same user", async () => {
    const response1 = await await getWeeklyResponse();
    expect(response1.status).toEqual(200);
    expect(calMock.get().history.get).toHaveLength(2);
    expect(cacheSpySet).toHaveBeenCalledTimes(1);
    expect(cacheSpySet).toHaveLastReturnedWith("calories-subject1");
    expect(cacheSpyGet).toHaveBeenCalledTimes(1);

    const response2 = await await getWeeklyResponse();
    expect(response2.status).toEqual(200);
    expect(calMock.get().history.get).toHaveLength(2);
    expect(cacheSpySet).toHaveBeenCalledTimes(1);
    expect(cacheSpySet).toHaveLastReturnedWith("calories-subject1");
    expect(cacheSpyGet).toHaveBeenCalledTimes(2);
    expect(cache.getInstance().has("calories-subject1")).toEqual(true);
    expect(cache.getInstance().keys()).toHaveLength(1);
    expect(response1.body).toEqual(response2.body);
  });

  it("should return cached data if request made a second time for the same user", async () => {
    const response1 = await getWeeklyResponse();
    expect(response1.status).toEqual(200);
    expect(calMock.get().history.get).toHaveLength(2);
    expect(cacheSpySet).toHaveBeenCalledTimes(1);
    expect(cacheSpySet).toHaveLastReturnedWith("calories-subject1");
    expect(cacheSpyGet).toHaveBeenCalledTimes(1);

    const response2 = await getWeeklyResponse("subject2");
    expect(response2.status).toEqual(200);
    expect(calMock.get().history.get).toHaveLength(4);
    expect(cacheSpySet).toHaveBeenCalledTimes(2);
    expect(cacheSpySet).toHaveLastReturnedWith("calories-subject2");
    expect(cache.getInstance().has("calories-subject1")).toEqual(true);
    expect(cache.getInstance().has("calories-subject2")).toEqual(true);
    expect(cache.getInstance().keys()).toHaveLength(2);
    expect(cacheSpyGet).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if the subject is not present in the accessToken", async () => {
    expect((await getWeeklyResponse("")).status).toBe(500);
  });
});
