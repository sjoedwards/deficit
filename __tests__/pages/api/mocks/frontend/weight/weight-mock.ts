import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { dailyWeightExpectedResponse } from "../../../../../expected-responses/weight/daily";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const weightMock = (mock?: MockAdapter): Mock => {
  const _mock = mock || new MockAdapter(axios);
  return {
    get: () => _mock,
    mockDefault: () => {
      const urlCalsInDaily = new RegExp("/api/weight/daily");

      _mock.onGet(urlCalsInDaily).reply(200, dailyWeightExpectedResponse);
    },
  };
};

export { weightMock };
