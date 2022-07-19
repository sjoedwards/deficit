import axios from "axios";
import React, { ReactElement, useReducer } from "react";
import { getWeeklyCalories } from "../../services/calories";
import WeeklyCaloriesRemaining from "../../services/weeklyCaloriesRemaining";
import { FitbitDailyCaloriesData } from "../../types";
import { stubbedCalories } from "../../__tests__/utils/stubs";

enum EStatus {
  PENDING = "PENDING",
  IDLE = "IDLE",
  ERROR = "ERROR",
}
interface BaseState {
  error?: unknown;
  status: EStatus;
}

interface WeeklyCaloriesRemainingState extends BaseState {
  averageCaloriesThisWeek?: number;
  caloriesRemainingPerDay?: number;
}

const initialWeeklyCaloriesRemainingState = {
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
    averageCaloriesThisWeek: number;
    caloriesRemainingPerDay: number;
  };
};

type UpdateFailureActionPayload = {
  type: EActionKind;
  error: unknown;
};

const WeeklyCaloriesRemainingContext = React.createContext<
  | { state: WeeklyCaloriesRemainingState; dispatch: React.Dispatch<Action> }
  | undefined
>(undefined);

const weeklyCaloriesRemainingReducer: React.Reducer<
  WeeklyCaloriesRemainingState,
  Action
> = (state, action) => {
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
        averageCaloriesThisWeek: (action as UpdateSuccessActionPayload).payload
          .averageCaloriesThisWeek,
        caloriesRemainingPerDay: (action as UpdateSuccessActionPayload).payload
          .caloriesRemainingPerDay,
        status: EStatus.IDLE,
      };
    }
    default: {
      return state;
    }
  }
};

const WeeklyCaloriesRemainingProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [state, dispatch] = useReducer(
    weeklyCaloriesRemainingReducer,
    initialWeeklyCaloriesRemainingState
  );
  const value = { state, dispatch };
  return (
    <WeeklyCaloriesRemainingContext.Provider value={value}>
      {children}
    </WeeklyCaloriesRemainingContext.Provider>
  );
};

const useWeeklyCaloriesRemaining = () => {
  const context = React.useContext(WeeklyCaloriesRemainingContext);
  if (context === undefined) {
    throw new Error(
      "useWeeklyCaloriesRemaining must be used within a WeeklyCaloriesRemainingProvider"
    );
  }
  return context;
};

const getInitialData = async (
  dispatch: React.Dispatch<Action>,
  goal: number
) => {
  dispatch({ type: EActionKind.UPDATE_START });
  try {
    const stubbed = process.env.NEXT_PUBLIC_STUBBED === "true";

    const calories = stubbed
      ? stubbedCalories
      : (await axios.get<FitbitDailyCaloriesData[]>("/api/calories/daily"))
          .data;

    const weeklyCaloriesRemainingService = new WeeklyCaloriesRemaining(
      calories,
      getWeeklyCalories,
      5
    );

    const averageCaloriesThisWeek = parseInt(
      weeklyCaloriesRemainingService.dailyCalorieDataForLastWeek.calories,
      10
    );

    const caloriesRemainingPerDay =
      weeklyCaloriesRemainingService.caloriesRequiredPerDayToMeetGoal(goal);

    dispatch({
      type: EActionKind.UPDATE_SUCCESS,
      payload: { averageCaloriesThisWeek, caloriesRemainingPerDay },
    });
  } catch (error) {
    dispatch({ type: EActionKind.UPDATE_FAIL, error });
  }
};

export {
  WeeklyCaloriesRemainingProvider,
  useWeeklyCaloriesRemaining,
  getInitialData,
};
