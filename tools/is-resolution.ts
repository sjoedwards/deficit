import { ResolutionNames } from "./../types/index";

export const isResolution = (
  resolution: string
): resolution is ResolutionNames =>
  resolution === "daily" || resolution === "weekly" || resolution === "monthly";
