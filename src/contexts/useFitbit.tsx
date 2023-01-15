import axios, { AxiosError, AxiosInstance } from "axios";
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
    fitbitClient.interceptors.request.use(function (request) {
      console.log(`Making request to ${request.url}`);
      return request;
    });
    fitbitClient.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        const isAxiosError = axios.isAxiosError(error);
        if (isAxiosError && error.response?.status === 401) {
          Router.push(
            `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${config.fitbit.clientId}&scope=activity%20nutrition%20weight&redirect_uri=${config.fitbit.redirectUri}`
          );
        }
        if (isAxiosError) {
          logError(
            `Request to ${
              (error as AxiosError).config.url
            } resulted in error: ${error.message}`
          );
        } else {
          logError(error);
        }
        return;
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
