import axios from "axios";
import React, { ReactElement, useEffect, useReducer } from "react";
import { getWeeklyWeight } from "../../services/weight";
import { FitbitDailyWeightData, FitbitWeeklyWeightData } from "../../types";
import { stubbedWeight } from "../../__tests__/utils/stubs";

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

const weightProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [WeightState, dispatch] = useReducer(weightReducer, initialWeightState);
  const value = { state: WeightState, dispatch };

  useEffect(() => {
    const fetchWeight = async () => {
      dispatch({ type: EActionKind.UPDATE_START });
      const stubbed = process.env.NEXT_PUBLIC_STUBBED === "true";
      const dailyWeight = stubbed
        ? stubbedWeight
        : (await axios.get<FitbitDailyWeightData[]>("/api/weight/daily")).data;
      const weeklyWeight = await getWeeklyWeight(dailyWeight);
      dispatch({
        type: EActionKind.UPDATE_SUCCESS,
        payload: { weight: { daily: dailyWeight, weekly: weeklyWeight } },
      });
    };
    fetchWeight();
  }, []);
  return (
    // Start here
    <WeightContext.Provider value={value}>{children}</WeightContext.Provider>
  );
};

const useweight = () => {
  const context = React.useContext(WeightContext);
  if (context === undefined) {
    throw new Error("useweight must be used within a weightProvider");
  }
  return context;
};

const getInitialData = async (dispatch: React.Dispatch<Action>) => {
  dispatch({ type: EActionKind.UPDATE_START });
  try {
  } catch (error) {
    dispatch({ type: EActionKind.UPDATE_FAIL, error });
  }
};

export { weightProvider, useweight, getInitialData };
