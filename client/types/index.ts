import { NextApiRequest } from "next";

export interface IExtendedRequest extends NextApiRequest {
  state?: {
    token?: string;
  };
}
