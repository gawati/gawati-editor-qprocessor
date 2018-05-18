const API_PROTOCOL = process.env.API_PROTOCOL || 'http' ;
const API_HOST = process.env.API_HOST || 'localhost' ;
const API_PORT = process.env.API_PORT || '8080' ;

/** Folders */
const CONFIG_FOLDER = () => 'configs';
const AKN_ATT_FOLDER = () => "../gawati-client-server/akn_data_test";
const TMP_AKN_FOLDER = () => "./akn";
const ZIP_FULLPATH = () => process.cwd() + '/akn.zip';


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
    ZIP_FULLPATH: ZIP_FULLPATH,
    AKN_DOC_TYPES: AKN_DOC_TYPES,
    PROCESS_NAME: PROCESS_NAME
};