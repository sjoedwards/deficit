const deficitExpectedResponse = {
  message:
    "At your daily deficit of -1095 calories (averaged over days this month), you are predicted to lose 0.044 kilograms per week, based off of your historic metabolic data. You need to average -1726 calories a day for the rest of the month.",
  averageDeficitCurrentMonth: "-1095",
  predictedWeeklyWeightDiff: {
    noMovingAverage: {
      weightDiffKilos: "-0.044",
      rSquaredValue: "0.091",
      deficitForRemainingDaysThisMonth: "-1726",
    },
    threePointMoving: {
      weightDiffKilos: "-0.009",
      rSquaredValue: "0.069",
      deficitForRemainingDaysThisMonth: "-2673",
    },
    fivePointMoving: {
      weightDiffKilos: "-0.022",
      rSquaredValue: "0.084",
      deficitForRemainingDaysThisMonth: "-2395",
    },
  },
  deficits: [{ dateTime: "2021-06-01", deficit: "-1095" }],
};
export { deficitExpectedResponse };
