import React, { ReactElement, useEffect, useReducer } from "react";
import { getWeeklyWeight } from "../../services/weight";
import { FitbitDailyWeightData, FitbitWeeklyWeightData } from "../../types";
import { stubbedWeight } from "../../__tests__/utils/stubs";
import { useFitbit } from "./useFitbit";

enum EStatus {
  PENDING = "PENDING",
  IDLE = "IDLE",
  ERROR = "ERROR",
}
interface BaseState {
  error?: unknown;
  status: EStatus;
}

interface WeightData {
  daily?: FitbitDailyWeightData[];
  weekly?: FitbitWeeklyWeightData[];
}

interface WeightState extends BaseState, WeightData {}

const initialWeightState = {
  status: EStatus.IDLE,
};

enum EActionKind {
  UPDATE_START = "UPDATE_START",
  UPDATE_SUCCESS = "UPDATE_FINISH",
  UPDATE_FAIL = "UPDATE_FAIL",
}

type Action =
  | SimpleAction
  | UpdateSuccessActionPayload
  | UpdateFailureActionPayload;

type SimpleAction = {
  type: EActionKind;
};

type UpdateSuccessActionPayload = {
  type: EActionKind;
  payload: {
    weight: WeightData;
  };
};

type UpdateFailureActionPayload = {
  type: EActionKind;
  error: unknown;
};

const WeightContext = React.createContext<
  { state: WeightState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

const weightReducer: React.Reducer<WeightState, Action> = (state, action) => {
  switch (action.type) {
    case EActionKind.UPDATE_FAIL: {
      return {
        ...state,
        error: (action as UpdateFailureActionPayload).error,
        status: EStatus.ERROR,
      };
    }
    case EActionKind.UPDATE_SUCCESS: {
      return {
        ...(action as UpdateSuccessActionPayload).payload.weight,
        status: EStatus.IDLE,
      };
    }
    default: {
      return state;
    }
  }
};

const WeightProvider = ({
  children,
  decimalPlaces = 2,
}: {
  children: ReactElement;
  decimalPlaces?: number;
}): ReactElement => {
  const [weightState, dispatch] = useReducer(weightReducer, initialWeightState);
  const value = { state: weightState, dispatch };

  const { fitbitClient } = useFitbit();

  useEffect(() => {
    const fetchWeight = async () => {
      dispatch({ type: EActionKind.UPDATE_START });
      const stubbed = process.env.NEXT_PUBLIC_STUBBED === "true";
      const roundNumericToDecimalPlaces = (
        value: string,
        decimalPlacesArg: number
      ): string => parseFloat(value).toFixed(decimalPlacesArg);

      const dailyWeights = stubbed
        ? stubbedWeight
        : (await fitbitClient.get<FitbitDailyWeightData[]>("/api/weight/daily"))
            ?.data;

      const weeklyWeights = await getWeeklyWeight(dailyWeights);

      const isNotUndefined = <T,>(value: T | undefined): value is T =>
        typeof value !== "undefined";

      const roundValue = <T, K extends keyof T>(entries: T[], key: K) =>
        entries
          .map((weightEntry) => {
            const test = weightEntry[key];
            if (typeof test === "string") {
              return {
                ...weightEntry,
                [key]: roundNumericToDecimalPlaces(test, decimalPlaces),
              };
            }
          })
          .filter(isNotUndefined);

      dispatch({
        type: EActionKind.UPDATE_SUCCESS,
        payload: {
          weight: {
            daily: roundValue(dailyWeights, "weight"),
            weekly: roundValue(weeklyWeights, "weight"),
          },
        },
      });
    };
    fetchWeight();
  }, []);
  return (
    <WeightContext.Provider value={value}>{children}</WeightContext.Provider>
  );
};

const useWeight = () => {
  const context = React.useContext(WeightContext);
  if (context === undefined) {
    throw new Error("useWeight must be used within a weightProvider");
  }
  return context;
};

export { WeightProvider, useWeight };
