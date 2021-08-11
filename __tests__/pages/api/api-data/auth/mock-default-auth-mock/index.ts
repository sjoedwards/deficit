import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createMockJWT } from "../../../../../utils/create-mock-jwt";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
  mockFailure: () => void;
}

const authMock = (mock?: MockAdapter): Mock => {
  const _mock = mock || new MockAdapter(axios);
  const _refreshUrl = new RegExp("https://api.fitbit.com/oauth2/token");

  return {
    get: () => _mock,
    mockDefault: (subject = "subject1") => {
      _mock.onPost(_refreshUrl).reply(200, {
        access_token: createMockJWT(subject),
        refresh_token: createMockJWT(subject),
      });
    },
    mockFailure: () => {
      _mock.onPost(_refreshUrl).reply(500, {
        errors: [
          {
            errorType: "invalid_client",
            message: "Refresh Token Error",
          },
        ],
        success: false,
      });
    },
  };
};

export { authMock };
