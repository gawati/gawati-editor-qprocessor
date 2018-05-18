const axios = require("axios");
const mq = require("./queues");

/**
 * Receives the Form posting, not suitable for multipart form data
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const receiveSubmitData = (req, res, next) =>  {
    console.log(" IN: receiveSubmitData");
    const formObject = req.body.data ; 
    res.locals.formObject = formObject; 
    next();
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const returnResponse = (req, res) => {
    console.log(" IN: returnResponse");    
    res.json(res.locals.returnResponse);
};

/**
 * Loads the XML document from the db given a specific IRI
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const loadXmlForIri = (req, res, next) => {
    console.log(" IN: loadXmlForIri");
    const loadXmlApi = servicehelper.getApi("xmlServer", "getXml");
    const {url, method} = loadXmlApi;    
    axios({
        method: method,
        url: url,
        data: res.locals.formObject
    }).then(
        (response) => {
            res.locals.aknObject = response.data;
            next();
        }
    ).catch(
        (err) => {
            res.locals.aknObject = err;
            next();
        }
    );
};

/**
 * Publishes the status for document iri on the STATUS_Q
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const publishOnStatusQ = (req, res, next) => {
    console.log(" IN: publishOnStatusQ");
    const {iri, status} = res.locals.formObject;

    //Publish on STATUS_Q
    // qName = 'STATUS_Q';
    // const ex = mq.getExchange();
    // const key = mq.getQKey(qName);
    // mq.getChannel(qName).publish(ex, key, new Buffer(iri));

    // res.locals.returnResponse = {
    //     'success': {
    //         'code': 'publish_document',
    //         'message': res.locals.formObject
    //     }
    // }
    next();
};

/**
 * API methods for each Request end point.
 * You need to call next() at the end to ensure the next api in the chain
 * gets called.
 * Calling res.json(res.locals.returnResponse) will return the response 
 * without proceeding to the next method in the API stack. 
 */
module.exports = {
    //Common methods
    receiveSubmitData: receiveSubmitData,
    returnResponse: returnResponse,

    //Publish methods
    loadXmlForIri: loadXmlForIri,
    publishOnStatusQ: publishOnStatusQ
};