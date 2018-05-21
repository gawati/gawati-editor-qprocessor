const sm = require("./statusMonitor");

/**
 * API stack for each Request end point. 
 * They are called one after the other in the order of the array
 */
var smAPIs  = {};

/*
Receives status updates for the document submitted for publish 
Input object submitted to the API:
"data": {
    "iri": "/akn/ke/act/legge/1970-06-03/Cap_44/eng@/!main",
    "status": "published"
}
 */
smAPIs["/publish/status"] = {
    method: "post",
    stack: [
        sm.receiveSubmitData,
        sm.publishOnStatusQ,
        sm.returnResponse
    ]
};

module.exports.smAPIs = smAPIs;