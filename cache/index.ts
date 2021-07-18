import NodeCache, { Key } from "node-cache";
import jwt from "jsonwebtoken";
import { IExtendedRequest } from "../types";

const nodeCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const getSubjectFromAccessToken = (request: IExtendedRequest) => {
  const accessToken = request?.state?.token;
  const { payload } = jwt?.decode(`${accessToken}`, { complete: true }) || {};

  if (!payload?.sub) {
    throw new Error("Could not obtain subject from access token");
  }
  return payload.sub;
};

const cache = {
  get: <T>(key: Key, request: IExtendedRequest): T | undefined => {
    const subject = getSubjectFromAccessToken(request);
    return nodeCache.get(`${key}-${subject}`);
  },
  set: <T>(key: Key, value: T, request: IExtendedRequest): string => {
    const subject = getSubjectFromAccessToken(request);
    const uniqueKey = `${key}-${subject}`;
    nodeCache.set(uniqueKey, value);
    return `${key}-${subject}`;
  },
  getInstance: (): NodeCache => nodeCache,
};

export { cache };
