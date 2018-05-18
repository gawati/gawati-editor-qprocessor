const axios = require("axios");
const logr = require("./logging.js");
const mq = require("./queues");
const servicehelper = require("./utils/ServiceHelper");
const aknhelper = require("./utils/AknHelper");
const zipFolder = require("./utils/ZipHelper");
const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const constants = require("./constants");

const postPkg = () => {
  console.log("postPkg");
}

const createZipPkg = () => {
  console.log("create zip");
}

const prepareZip = (docXml, aknObj, iri) => {
  console.log("Get attachments");
  const attObj = aknhelper.getAttObject(aknObj.akomaNtoso);

  //Create the folder structure
  let arrIri = iri.split("/");
  let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
  let dest = path.join(constants.TMP_ATTACHMENTS(), subPath);
  let src = path.join(constants.AKN_ATTACHMENTS(), subPath);

  //Copies attachment files to attachments/
  mkdirp(dest, function(err) {
    if (err) {
      logr.error(generalhelper.serverMsg(" ERROR while creating folder "), err);
    } else {
      fs.copy(src, dest)
      .then(result => {
        zipFolder(dest, constants.ZIP_PATH());
        //Post to Portal and get response.
        //Publish status on STATUS_Q.
      })
      .catch(err => {
        console.log(err);
      });
    }
  });

  //Zip attachments/ and xml doc
}

/**
 * Get XML for iri.
 * Returns a promise.
 */
const loadXmlForIri = (iri) => {
  console.log(" IN: loadXmlForIri");
  const loadXmlApi = servicehelper.getApi("xmlServer", "getXml");
  const {url, method} = loadXmlApi;
  return axios({
    method: method,
    url: url,
    data: {iri}
  });
}

/**
 * Get JSON for iri.
 * Returns a promise.
 */
const loadJsonForIri = (iri) => {
  console.log(" IN: loadJsonForIri");
  const loadJsonApi = servicehelper.getApi("xmlServer", "getJson");
  const {url, method} = loadJsonApi;
  return axios({
      method: method,
      url: url,
      data: {iri}
  });
}

//Get XML, Attachments, Zip and post to Portal
const toPortal = (iri) => {
  console.log(" IN: toPortal");
  
  axios.all([loadXmlForIri(iri), loadJsonForIri(iri)])
  .then(axios.spread(function (xmlRes, jsonRes) {
    if (jsonRes.data.error) {
      console.log(jsonRes.data);
    } else {
      prepareZip(xmlRes.data, jsonRes.data, iri);
    }
  }))
  .catch(err => console.log(err));
};

module.exports.toPortal = toPortal;