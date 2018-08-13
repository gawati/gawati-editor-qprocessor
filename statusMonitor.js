const axios = require("axios");
const mq = require("./queues");
const qh = require("./utils/QueueHelper");

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
 * Publishes the status for document iri on the STATUS_Q
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const publishOnStatusQ = (req, res, next) => {
    console.log(" IN: publishOnStatusQ");
    const {iri, status, message} = res.locals.formObject;
    qh.publishStatus(qh.formMsg(iri, status, message));

    res.locals.returnResponse = {
        'success': {
            'code': 'publish_retract_status',
            'message': res.locals.formObject
        }
    }
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
    receiveSubmitData: receiveSubmitData,
    publishOnStatusQ: publishOnStatusQ,
    returnResponse: returnResponse
};