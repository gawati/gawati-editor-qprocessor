const appconstants = require("../constants");

const coerceIntoArray = (obj) => {
    return Array.isArray(obj) ? obj : [obj] || [];
};


const stringWhitespaceTrim = (aString) => {
    return aString.replace(/\s+/g,' ')
               .replace(/^\s+|\s+$/,'');
 };

/**
 * This prefixes log messages with the process name
 * @param {*} message 
 */
const serverMsg = (message) => {
    return `${appconstants.PROCESS_NAME}: ${message}`;
};

const error = (message,code = "general") => {
    return {"error": {"code": code, "value": message}};
};

module.exports = {
    coerceIntoArray: coerceIntoArray,
    stringWhitespaceTrim: stringWhitespaceTrim,
    serverMsg: serverMsg,
    error: error
};
