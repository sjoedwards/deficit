import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { caloriesApiData } from "../../../api-data/calories";

interface Mock {
  get: () => MockAdapter;
  mockDefault: () => void;
}

const calorieMock = (): Mock => {
  const mock = new MockAdapter(axios);

  return {
    get: () => mock,
    mockDefault: () => {
      const urlCalsInMonthly = new RegExp(
        "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/date/today/3m.json"
      );
      const urlActivitiesCalsMonthly = new RegExp(
        "https://api.fitbit.com/1/user/-/activities/calories/date/today/3m.json"
      );
      mock.onGet(urlCalsInMonthly).reply(200, {
        "foods-log-caloriesIn": caloriesApiData["foods-log-caloriesIn"],
      });
      mock.onGet(urlActivitiesCalsMonthly).reply(200, {
        "activities-calories": caloriesApiData["activities-calories"],
      });

      const fitbitApiCalories = new RegExp(
        "https://api.fitbit.com/1/user/-/foods/log/caloriesIn/"
      );
      const fitbitApiActivities = new RegExp(
        "https://api.fitbit.com/1/user/-/activities/"
      );
      mock.onGet(fitbitApiCalories).reply(500);
      mock.onGet(fitbitApiActivities).reply(500);
    },
  };
};

export { calorieMock };
