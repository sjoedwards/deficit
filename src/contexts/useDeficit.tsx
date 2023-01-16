import React, { ReactElement, useEffect, useReducer } from "react";
import { deficitService } from "../../services/deficit";
import {
  BaseState,
  EActionKind,
  EStatus,
  FitbitDailyWeightData,
  IDeficitServiceResponse,
  SimpleAction,
  UpdateFailureActionPayload,
} from "../../types";
import { useCalories } from "./useCalories";
import { useWeight } from "./useWeight";

interface DeficitState extends BaseState {
  weight?: FitbitDailyWeightData[];
  deficit?: IDeficitServiceResponse;
}

const initialDeficitState = {
  status: EStatus.IDLE,
};

type Action =
  | SimpleAction
  | UpdateSuccessActionPayload
  | UpdateFailureActionPayload;

type UpdateSuccessActionPayload = {
  type: EActionKind;
  payload: {
    deficit: IDeficitServiceResponse;
  };
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
        deficit: (action as UpdateSuccessActionPayload).payload.deficit,
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

  const { state: caloriesState } = useCalories();
  const { state: weightState } = useWeight();

  const { daily: dailyCalories } = caloriesState;
  const { daily: dailyWeights } = weightState;

  useEffect(() => {
    const updateDeficit = async () => {
      if (!dailyCalories || !dailyWeights) {
        return;
      }
      dispatch({ type: EActionKind.UPDATE_START });
      try {
        console.log("year 1", new Date().getFullYear());

        const deficit = await deficitService(dailyWeights, dailyCalories);

        dispatch({
          type: EActionKind.UPDATE_SUCCESS,
          payload: { deficit },
        });
      } catch (error) {
        console.error(error);
        dispatch({ type: EActionKind.UPDATE_FAIL, error });
      }
    };
    updateDeficit();
  }, [dailyCalories, dailyWeights]);
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

export { DeficitProvider, useDeficit };
