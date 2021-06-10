const deficitExpectedResponse = {
  message:
    "At your daily deficit of -548 calories (averaged over days this month), you are predicted to gain 0.123 kilograms per week, based off of your historic metabolic data",
  averageDeficitCurrentMonth: "-548",
  predictedWeeklyWeightDiff: {
    rSquaredValue: "0.212",
    weightDiffKilos: "0.123",
  },
  deficits: [
    { dateTime: "2021-06-01", deficit: "-1090" },
    { dateTime: "2021-06-02", deficit: "-5" },
  ],
};
export { deficitExpectedResponse };
