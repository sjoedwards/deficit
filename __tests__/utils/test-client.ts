import { createServer } from "http";
import { NextApiHandler } from "next";
import { apiResolver } from "next/dist/next-server/server/api-utils";
import request from "supertest";

export const testClient = async (
  handler: NextApiHandler,
  query?: Record<string, string>,
  { host = "example.com" }: { host?: string } = {}
) =>
  request(
    createServer(async (req, res) => {
      req.headers.host = host;

      return apiResolver(req, res, query, handler, {} as any, true);
    })
  );
