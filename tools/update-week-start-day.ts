import moment from "moment";
export const updateWeekStartDay = (startDay: number = 1): void => {
  moment.updateLocale("en-gb", {
    week: {
      dow: startDay, // First day of week is Monday
    },
  });
};
