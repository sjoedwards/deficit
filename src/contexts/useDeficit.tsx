import React, { ReactElement, useReducer } from "react";

const DeficitContext = React.createContext({});

const deficitReducer = (state: {}, action: { type: string }) => {
  // Start here
  console.log(
    "🚀 ~ file: useDeficit.tsx ~ line 6 ~ deficitReducer ~ action",
    action
  );
  console.log(
    "🚀 ~ file: useDeficit.tsx ~ line 6 ~ deficitReducer ~ state",
    state
  );
  return {};
};

const DeficitProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [state, dispatch] = useReducer(deficitReducer, { deficit: {} });
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

export { DeficitProvider, useDeficit };
