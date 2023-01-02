import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { ReactElement } from "react";
import { FitbitProvider } from "../src/contexts/useFitbit";

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  return (
    <FitbitProvider>
      <Component {...pageProps} />
    </FitbitProvider>
  );
}
export default MyApp;
