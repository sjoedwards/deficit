import { FitbitWeeklyWeightData } from "../types";

const simpleMovingWeightAverage = (
  weights: FitbitWeeklyWeightData[],
  window = 5
): FitbitWeeklyWeightData[] => {
  if (!weights || weights.length < window) {
    return [];
  }

  if (!weights.every(({ weightDiff }) => weightDiff)) {
    return [];
  }

  // e.g index = 2 when window is 3
  let index = window - 1;

  const length = weights.length + 1;

  const simpleMovingAverages = [];
  while (++index < length) {
    // index incremented, so now 3

    // 3-3 = 0 weights.slice(0, 3); Gets first 3 items
    const windowSlice = weights.slice(index - window, index);
    // Sum and average slice
    const sum = windowSlice.reduce((prev, { weightDiff = "" }) => {
      return prev + parseFloat(weightDiff);
    }, 0);
    const averageWeightDiff = sum / window;
    const middleElement = windowSlice[Math.round((windowSlice.length - 1) / 2)];
    simpleMovingAverages.push({
      ...middleElement,
      weightDiff: averageWeightDiff.toString(),
    });
  }

  return simpleMovingAverages;
};

export { simpleMovingWeightAverage };
