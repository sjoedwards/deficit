import { FitbitWeightData } from "../../types";

export const getWeightWithDiff = <T extends FitbitWeightData>(weight: T[]) => {
  return weight
    .map((value, index) => {
      const previousValueWeight =
        index !== 0 ? parseFloat(weight[index - 1].weight) : undefined;

      return {
        ...value,
        weightDiff:
          typeof previousValueWeight !== "undefined"
            ? (parseFloat(value.weight) - previousValueWeight)?.toString()
            : undefined,
      };
    })
    .filter(({ weightDiff }) => weightDiff);
};
