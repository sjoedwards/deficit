import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { weightApiData } from "..";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const weightMock = (): Mock => {
  const mock = new MockAdapter(axios);

  return {
    get: () => mock,
    mockDefault: () => {
      const urlWeightMonthly = new RegExp(
        "https://api.fitbit.com/1/user/-/body/weight/date/today/3m.json"
      );
      mock.onGet(urlWeightMonthly).reply(200, {
        "body-weight": weightApiData["body-weight"],
      });
      const fitbitApiweight = new RegExp(
        "https://api.fitbit.com/1/user/-/body/weight"
      );
      mock.onGet(fitbitApiweight).reply(500);
    },
  };
};

export { weightMock };
