"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var port = process.env.PORT || 3000;
app_1.app.listen(port, function () {
    /* eslint-disable-next-line no-console */
    console.log("Listening on port " + port);
});
