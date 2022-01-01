const deficitExpectedResponse = {
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
  currentQuarter: {
    averageDeficitCurrentQuarter: "-710",
    predictedWeeklyWeightDiff: {
      noMovingAverage: {
        deficitForRemainingDaysThisQuarter: "-3773",
        rSquaredValue: "0.091",
        weightDiffKilos: "0.086",
      },
    },
  },
};
export { deficitExpectedResponse };
