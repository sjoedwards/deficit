import axios, { AxiosInstance } from "axios";
import React, { ReactElement, useMemo } from "react";
import { logError } from "../../tools/log-error";
import Router from "next/router";

const getConfig = () => ({
  urls: {
    deficit: process.env.NEXT_PUBLIC_DEFICIT_URL || "",
  },
  fitbit: {
    clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI,
  },
});
const config = getConfig();
const fitbitClient = axios.create();

interface FitbitState {
  fitbitClient: AxiosInstance;
}

const FitbitContext = React.createContext<FitbitState | undefined>(undefined);

const FitbitProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  useMemo(() => {
    fitbitClient.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        console.log(
          "🚀 ~ file: useFitbit.tsx:35 ~ useMemo ~ error",
          error.toJSON()
        );
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        } else {
          logError(`${error}`);
        }
      }
    );
  }, []);
  return (
    <FitbitContext.Provider value={{ fitbitClient }}>
      {children}
    </FitbitContext.Provider>
  );
};

const useFitbit = () => {
  const context = React.useContext(FitbitContext);
  if (context === undefined) {
    throw new Error("useFitbit must be used within a FitbitProvider");
  }
  return context;
};

export { FitbitProvider, useFitbit };
