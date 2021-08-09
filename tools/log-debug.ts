const logDebug = (message: string): void => {
  if (process.env.NEXT_LOG_LEVEL?.toLowerCase() === "debug") {
    console.log(message);
  }
};

export { logDebug };
