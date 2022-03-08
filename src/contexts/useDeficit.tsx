import React, { ReactElement, useReducer } from "react";
import { IDeficitApiData } from "../../types";

enum EStatus {
  PENDING = "PENDING",
  IDLE = "IDLE",
  ERROR = "ERROR",
}
interface BaseState {
  error?: string;
  status: EStatus;
}

interface DeficitState extends BaseState {
  deficit?: {
    test: "test";
  };
}

const initialDeficitState = {
  status: EStatus.IDLE,
};

enum EActionKind {
  UPDATE_START = "UPDATE_START",
  UPDATE_SUCCESS = "UPDATE_FINISH",
  UPDATE_FAIL = "UPDATE_FAIL",
}

type Action = {
  type: EActionKind;
  payload: IDeficitApiData;
};
const DeficitContext = React.createContext<
  { state: DeficitState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

function deficitReducer(state: DeficitState, action: { type: string }) {
  console.log(
    "🚀 ~ file: useDeficit.tsx ~ line 6 ~ deficitReducer ~ action",
    action
  );
  console.log(
    "🚀 ~ file: useDeficit.tsx ~ line 6 ~ deficitReducer ~ state",
    state
  );
  return {
    status: EStatus.IDLE,
  };
}

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
    throw new Error("useCount must be used within a DeficitProvider");
  }
  return context;
};

const updateDeficit = async (dispatch, updates) => {
  dispatch({ type: "start update", updates });
  try {
    const updatedUser = await userClient.updateUser(user, updates);
    dispatch({ type: "finish update", updatedUser });
  } catch (error) {
    dispatch({ type: "fail update", error });
  }
};

export { DeficitProvider, useDeficit, updateDeficit };
