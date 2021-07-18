const getDeficitForWeightDiff = (
  goal: number,
  intercept: number,
  gradient: number
): number => {
  // y = mx + c
  // weightDiff = m * deficit + c
  // (weightDiff - c) / m = deficit
  return (goal - intercept) / gradient;
};

export { getDeficitForWeightDiff };
