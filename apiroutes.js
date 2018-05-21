const express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
const packageJSON = require("./package.json");
const smapis = require ("./statusMonitor.routes");

var upload = multer();

var router = express.Router();

var jsonParser = bodyParser.json();

/** adding Publish Status Monitor apis */
Object.keys(smapis.smAPIs).forEach(
    (routePath) => {
        const smRoute = smapis.smAPIs[routePath];
        console.log(` ROUTE PATH = ${routePath} with ${smRoute.method}`);
        switch(smRoute.method) {
        case "get":
            router.get(
                routePath,
                jsonParser,
                smRoute.stack
            );
            break;
        case "post":
            router.post(
                routePath,
                jsonParser,
                smRoute.stack
            );
            break;
        default:
            logr.error(`Unknown method provide ${smRoute.method} only "get" and "post" are supported` );
            break;
        }
    }
);

module.exports = router;

