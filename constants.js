const path = require("path");
const API_PROTOCOL = process.env.API_PROTOCOL || 'http' ;
const API_HOST = process.env.API_HOST || 'localhost' ;
const API_PORT = process.env.API_PORT || '8080' ;

/** Folders */
const CONFIG_FOLDER = () => 'configs';
const AKN_ATT_FOLDER = () => path.join("..", "gawati-editor-fe", "akn_data");
const TMP_AKN_FOLDER = () => path.join(".", "tmp");


const API_SERVER_BASE = () =>
    API_PROTOCOL + '://' + API_HOST + ":" + API_PORT + '/exist/restxq';

const PROCESS_NAME = "GAWATI-EDITOR-QPROCESSOR";

// see http://schema.akomantoso.com/index.html?type=element&item=akomaNtoso
const AKN_DOC_TYPES = [
    "amendmentList",
    "officialGazette", 
    "documentCollection", 
    "act", 
    "bill", 
    "debateReport", 
    "debate",
    "statement",
    "amendment",
    "judgment",
    "portion",
    "doc" 
];

module.exports = {
    CONFIG_FOLDER: CONFIG_FOLDER,
    API_SERVER_BASE: API_SERVER_BASE,
    AKN_ATT_FOLDER: AKN_ATT_FOLDER,
    TMP_AKN_FOLDER: TMP_AKN_FOLDER,
    AKN_DOC_TYPES: AKN_DOC_TYPES,
    PROCESS_NAME: PROCESS_NAME
};