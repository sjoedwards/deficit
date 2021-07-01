import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { weightApiData } from "..";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const weightMock = (mock?: MockAdapter): Mock => {
  const _mock = mock || new MockAdapter(axios);

  return {
    get: () => _mock,
    mockDefault: () => {
      Object.entries(weightApiData).forEach(([monthToMock, mockData]) => {
        const urlWeightMonthly = new RegExp(
          `https://api.fitbit.com/1/user/-/body/log/weight/date/${monthToMock}/1m.json`
        );
        _mock.onGet(urlWeightMonthly).reply(200, {
          weight: mockData,
        });
      });
      const fitbitApiweight = new RegExp(
        "https://api.fitbit.com/1/user/-/body/log/weight"
      );
      _mock.onGet(fitbitApiweight).reply(500);
    },
  };
};

export { weightMock };
