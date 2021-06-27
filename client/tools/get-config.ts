const getConfig = () => ({
  urls: {
    deficit: process.env.NEXT_PUBLIC_DEFICIT_URL || "",
    redirect: process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI || "",
    token: process.env.NEXT_PUBLIC_TOKEN_URI || "",
  },
});

export { getConfig };
