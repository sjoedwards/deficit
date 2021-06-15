import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { caloriesApiData } from "..";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const calorieMock = (mock?: MockAdapter): Mock => {
  const _mock = mock || new MockAdapter(axios);

  return {
    get: () => _mock,
    mockDefault: () => {
      const urlCalsInMonthly = new RegExp(
        "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/6m.json"
      );
      const urlActivitiesCalsMonthly = new RegExp(
        "https://api.fitbit.com/1/user/-/activities/calories/date/today/6m.json"
      );
      _mock.onGet(urlCalsInMonthly).reply(200, {
        "foods-log-caloriesIn": caloriesApiData["foods-log-caloriesIn"],
      });
      _mock.onGet(urlActivitiesCalsMonthly).reply(200, {
        "activities-calories": caloriesApiData["activities-calories"],
      });

      const fitbitApiCalories = new RegExp(
        "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/"
      );
      const fitbitApiActivities = new RegExp(
        "https://api.fitbit.com/1/user/-/activities/"
      );
      _mock.onGet(fitbitApiCalories).reply(500);
      _mock.onGet(fitbitApiActivities).reply(500);
    },
  };
};

export { calorieMock };
