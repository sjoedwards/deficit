import { IExtendedRequest } from "./../types/index";

const logWarning = (message: string, request: IExtendedRequest) =>
  console.warn(message, JSON.stringify(request.state));

export { logWarning };
