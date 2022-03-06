import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { dailyCaloriesExpectedResponse } from "../../../../../expected-responses/calories/daily";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const calorieMock = (mock?: MockAdapter): Mock => {
  const _mock = mock || new MockAdapter(axios);
  return {
    get: () => _mock,
    mockDefault: () => {
      const urlCalsInDaily = new RegExp("/api/calories/daily");

      _mock.onGet(urlCalsInDaily).reply(200, dailyCaloriesExpectedResponse);
    },
  };
};

export { calorieMock };
