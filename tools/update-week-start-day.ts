import moment from "moment";
export const updateWeekStartDay = (startDay: number): void => {
  moment.updateLocale("en-gb", {
    week: {
      dow: 1, // First day of week is Monday
    },
  });
};
