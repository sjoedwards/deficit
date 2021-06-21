"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.setTokenFromCookieMiddleware = void 0;
var btoa_1 = require("btoa");
var axios_1 = require("axios");
var refreshAccessToken = function (refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
    var clientSecret, clientId, authString, headers, response, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                clientSecret = process.env.FITBIT_CLIENT_SECRET;
                clientId = process.env.FITBIT_CLIENT_ID;
                authString = btoa_1["default"](clientId + ":" + clientSecret);
                headers = {
                    Authorization: "Basic " + authString,
                    "Content-Type": "application/x-www-form-urlencoded"
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1["default"]({
                        url: "https://api.fitbit.com/oauth2/token?grant_type=refresh_token&refresh_token=" + refreshToken,
                        method: "post",
                        headers: headers
                    })];
            case 2:
                response = _a.sent();
                /* eslint-disable-next-line no-console */
                console.log("Successfully obtained token");
                return [2 /*return*/, response && response.data];
            case 3:
                e_1 = _a.sent();
                /* eslint-disable-next-line no-console */
                console.log("Failed to obtain token");
                /* eslint-disable-next-line no-console */
                console.log(e_1 && e_1.response && e_1.response.data);
                throw e_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
var setTokenFromCookieMiddleware = function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var accessToken, refreshToken, tokens, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.cookies.get("accessToken")];
            case 1:
                accessToken = _a.sent();
                return [4 /*yield*/, ctx.cookies.get("refreshToken")];
            case 2:
                refreshToken = _a.sent();
                if (!accessToken) return [3 /*break*/, 3];
                /* eslint-disable-next-line no-console */
                console.log("Token obtained from cookie");
                ctx.state.token = accessToken;
                return [3 /*break*/, 7];
            case 3:
                if (!refreshToken) return [3 /*break*/, 7];
                /* eslint-disable-next-line no-console */
                console.log("Refreshing token");
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, refreshAccessToken(refreshToken)];
            case 5:
                tokens = _a.sent();
                if (tokens) {
                    ctx.cookies.set("accessToken", tokens.access_token, {
                        maxAge: tokens.expires_in
                    });
                }
                ctx.state.token = tokens && tokens.access_token;
                return [3 /*break*/, 7];
            case 6:
                e_2 = _a.sent();
                /* eslint-disable-next-line no-console */
                console.log("Failed to refresh token");
                /* eslint-disable-next-line no-console */
                console.log(e_2 && e_2.response && e_2.response.data);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/, next()];
        }
    });
}); };
exports.setTokenFromCookieMiddleware = setTokenFromCookieMiddleware;
