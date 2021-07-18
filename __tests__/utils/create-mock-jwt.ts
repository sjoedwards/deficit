import jwt from "jsonwebtoken";

const createMockJWT = (subject = "subject1"): string =>
  jwt.sign({ sub: subject }, "signingKey");

export { createMockJWT };
