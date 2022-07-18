import axios from "axios";
import React, { ReactElement, useReducer } from "react";
import {
  FitbitDailyCaloriesData,
  FitbitDailyWeightData,
  IDeficitServiceResponse,
} from "../../types";
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

interface DeficitState extends BaseState {
  calories?: FitbitDailyCaloriesData[];
  weight?: FitbitDailyWeightData[];
  deficit?: IDeficitServiceResponse;
}

const initialDeficitState = {
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
    calories: FitbitDailyCaloriesData[];
  };
};

type UpdateFailureActionPayload = {
  type: EActionKind;
  error: unknown;
};

const DeficitContext = React.createContext<
  { state: DeficitState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

const deficitReducer: React.Reducer<DeficitState, Action> = (state, action) => {
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
        calories: (action as UpdateSuccessActionPayload).payload.calories,
        status: EStatus.IDLE,
      };
    }
    default: {
      return state;
    }
  }
};

const DeficitProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [state, dispatch] = useReducer(deficitReducer, initialDeficitState);
  const value = { state, dispatch };
  return (
    <DeficitContext.Provider value={value}>{children}</DeficitContext.Provider>
  );
};

const useDeficit = () => {
  const context = React.useContext(DeficitContext);
  if (context === undefined) {
    throw new Error("useDeficit must be used within a DeficitProvider");
  }
  return context;
};

const getInitialData = async (dispatch: React.Dispatch<Action>) => {
  dispatch({ type: EActionKind.UPDATE_START });
  try {
    const stubbed = process.env.NEXT_PUBLIC_STUBBED === "true";

    const calories = stubbed
      ? stubbedCalories
      : (await axios.get<FitbitDailyCaloriesData[]>("/api/calories/daily"))
          .data;

    dispatch({
      type: EActionKind.UPDATE_SUCCESS,
      payload: { calories },
    });
  } catch (error) {
    dispatch({ type: EActionKind.UPDATE_FAIL, error });
  }
};

export { DeficitProvider, useDeficit, getInitialData };
