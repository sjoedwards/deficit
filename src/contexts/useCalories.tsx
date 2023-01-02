import React, { ReactElement, useEffect, useReducer } from "react";
import { getWeeklyCalories } from "../../services/calories";
import { FitbitDailyCaloriesData, FitbitWeeklyCaloriesData } from "../../types";
import { stubbedCalories } from "../../__tests__/utils/stubs";
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

interface CaloriesData {
  daily?: FitbitDailyCaloriesData[];
  weekly?: FitbitWeeklyCaloriesData[];
}

interface CaloriesState extends BaseState, CaloriesData {}

const initialCaloriesState = {
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
    calories: CaloriesData;
  };
};

type UpdateFailureActionPayload = {
  type: EActionKind;
  error: unknown;
};

const CaloriesContext = React.createContext<
  { state: CaloriesState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

const caloriesReducer: React.Reducer<CaloriesState, Action> = (
  state,
  action
) => {
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
        ...(action as UpdateSuccessActionPayload).payload.calories,
        status: EStatus.IDLE,
      };
    }
    default: {
      return state;
    }
  }
};

const CaloriesProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const { fitbitClient } = useFitbit();
  const [caloriesState, dispatch] = useReducer(
    caloriesReducer,
    initialCaloriesState
  );
  const value = { state: caloriesState, dispatch };

  useEffect(() => {
    const fetchCalories = async () => {
      dispatch({ type: EActionKind.UPDATE_START });
      const stubbed = process.env.NEXT_PUBLIC_STUBBED === "true";
      const dailyCalories = stubbed
        ? stubbedCalories
        : (
            await fitbitClient.get<FitbitDailyCaloriesData[]>(
              "/api/calories/daily"
            )
          )?.data;
      const weeklyCalories = getWeeklyCalories(dailyCalories);
      dispatch({
        type: EActionKind.UPDATE_SUCCESS,
        payload: { calories: { daily: dailyCalories, weekly: weeklyCalories } },
      });
    };
    fetchCalories();
  }, [fitbitClient]);
  return (
    <CaloriesContext.Provider value={value}>
      {children}
    </CaloriesContext.Provider>
  );
};

const useCalories = () => {
  const context = React.useContext(CaloriesContext);
  if (context === undefined) {
    throw new Error("useCalories must be used within a caloriesProvider");
  }
  return context;
};

export { CaloriesProvider, useCalories };
