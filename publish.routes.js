const publish = require("./publish");

/**
 * API stack for each Request end point. 
 * They are called one after the other in the order of the array
 */
var publishAPIs  = {};

/*
Prepares zip package of document to be published.
Input object submitted to the API:
"data": {
    "iri": "/akn/ke/act/legge/1970-06-03/Cap_44/eng@/!main"
}
 */
publishAPIs["/publish/submit"] = {
    method: "post", 
    stack: [
        publish.receiveSubmitData,
        publish.loadXmlForIri,
        publish.returnResponse
    ]
};

/*
Receives status updates for the document submitted for publish 
Input object submitted to the API:
"data": {
    "iri": "/akn/ke/act/legge/1970-06-03/Cap_44/eng@/!main",
    "status": "complete"
}
 */
publishAPIs["/publish/status"] = {
    method: "post",
    stack: [
        publish.receiveSubmitData,
        publish.publishOnStatusQ,
        publish.returnResponse
    ]
};

module.exports.publishAPIs = publishAPIs;