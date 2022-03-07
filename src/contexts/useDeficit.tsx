import React, { ReactElement, useReducer } from "react";

const DeficitContext = React.createContext({});

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

// What will be the type of action.payload here?
function deficitReducer(state: DeficitState, action: { type: string }) {
  // Start here
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

// const updateDeficit = async (dispatch, deficit, updates) => {
//   console.log(
//     "🚀 ~ file: useDeficit.tsx ~ line 51 ~ updateDeficit ~ updates",
//     updates
//   );
//   console.log(
//     "🚀 ~ file: useDeficit.tsx ~ line 51 ~ updateDeficit ~ deficit",
//     deficit
//   );
//   console.log(
//     "🚀 ~ file: useDeficit.tsx ~ line 51 ~ updateDeficit ~ dispatch",
//     dispatch
//   );
// Do datafetch here, i.e.
// dispatch({ type: "start update", updates });
// try {
//   const updatedUser = await userClient.updateUser(user, updates);
//   dispatch({ type: "finish update", updatedUser });
// } catch (error) {
//   dispatch({ type: "fail update", error });
// }
// };

export { DeficitProvider, useDeficit };
