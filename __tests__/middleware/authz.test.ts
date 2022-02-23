import { testClient } from "./../utils/test-client";
import weightHandler from "../../pages/api/weight/[resolution]";

describe("Authz", () => {
  test("responds 401 to unauth'd  GET", async () => {
    const client = await testClient(weightHandler, { resolution: "daily" });
    const response = await client.get("/api/");
    expect(response.status).toBe(401);
  });
});
