import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { ReactElement } from "react";
import { FitbitProvider } from "../src/contexts/useFitbit";

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  if (process.env.NEXT_PUBLIC_STUBBED === "true") {
    require("../mocks");
  }
  return (
    <FitbitProvider>
      <Component {...pageProps} />
    </FitbitProvider>
  );
}
export default MyApp;
