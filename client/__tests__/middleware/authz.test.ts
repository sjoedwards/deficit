import { testClient } from "./../utils/test-client";
import deficitHandler from "../../pages/api/deficit";

describe("Authz", () => {
  test("responds 401 to unauth'd  GET", async () => {
    const client = await testClient(deficitHandler);
    const response = await client.get("/api/");
    expect(response.status).toBe(401);
  });
});
