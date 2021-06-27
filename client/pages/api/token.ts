import { NextApiRequest, NextApiResponse } from "next";
import { logError } from "../../tools/log-error";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookie = req?.headers?.cookie;

  if (!cookie) {
    logError("No cookie present");
    res.status(500).end();
  } else {
    res.setHeader("cookie", cookie);
    res.redirect("/");
  }
};

export default handler;
