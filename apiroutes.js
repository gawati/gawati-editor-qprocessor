const express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
const packageJSON = require("./package.json");
const publishapis = require ("./publish.routes");

var upload = multer();

var router = express.Router();

var jsonParser = bodyParser.json();

/** adding document publish apis */
Object.keys(publishapis.publishAPIs).forEach(
    (routePath) => {
        const publishRoute = publishapis.publishAPIs[routePath];
        console.log(` ROUTE PATH = ${routePath} with ${publishRoute.method}`);
        switch(publishRoute.method) {
        case "get":
            router.get(
                routePath,
                jsonParser,
                publishRoute.stack
            );
            break;
        case "post":
            router.post(
                routePath,
                jsonParser,
                publishRoute.stack
            );
            break;
        default:
            logr.error(`Unknown method provide ${publishRoute.method} only "get" and "post" are supported` );
            break;
        }
    }
);  

module.exports = router;

