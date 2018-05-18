const axios = require("axios");
const logr = require("./logging.js");
const mq = require("./queues");
const servicehelper = require("./utils/ServiceHelper");
const zipFolder = require("./utils/ZipHelper");
const urihelper = require("./utils/UriHelper");
const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const constants = require("./constants");

const postPkg = (iri) => {
  //Create md5 checksum
  console.log("postPkg", iri, constants.ZIP_FULLPATH());
}

/**
 * Writes a given xml string to file.
 */
const writeXml = (docXml, filename) => {
  return new Promise(function(resolve, reject) {
    fs.writeFile(filename, docXml, function(err) {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

/**
 * Copy attachments from src to dest.
 */
const copyAtt = (src, dest) => {
  return new Promise(function(resolve, reject) {
    fs.copy(src, dest, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Remove file/folder at path.
 * Removes files in folder recursively (like rm -rf)
 */
const removeFileFolder = (path) => {
  return new Promise(function(resolve, reject) {
    fs.remove(path, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Create a temporary folder 'akn/' to hold
 * a. Doc XML
 * b. Attachments
 * We also create the attachment folder structure inside akn/
 * Create a zip folder, 'akn.zip'
 */
async function prepareZip(docXml, iri) {
  const tmpAknDir = constants.TMP_AKN_FOLDER();
  const zipPath = constants.ZIP_FULLPATH();

  //Remove any existing zip and temp folder
  const [res1, res2] = await Promise.all([removeFileFolder(tmpAknDir), removeFileFolder(zipPath)]);
  if(res1 && res2) {
    //Filename for doc XML
    const xmlFilename = tmpAknDir + "/" + urihelper.fileNameFromIRI(iri, "xml");

    //Create the folder structure for attachments
    let arrIri = iri.split("/");
    let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
    let attDest = path.join(tmpAknDir, subPath);
    let attSrc = path.join(constants.AKN_ATT_FOLDER(), subPath);

    //creates the parent folder 'akn' as well as the attachment folder structure
    mkdirp(attDest, function(err) {
      if (err) {
        logr.error(generalhelper.serverMsg(" ERROR while creating folder "), err);
      } else {
        axios.all([writeXml(docXml, xmlFilename), copyAtt(attSrc, attDest)])
        .then(axios.spread(function (xmlRes, attRes) {
          zipFolder(tmpAknDir, zipPath);
          postPkg(iri);
        }))
        .catch(err => console.log(err));
      }
    });
  } else {
    console.log(res1, res2);
  }
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

//Get XML, Attachments, Zip and post to Portal
const toPortal = (iri) => {
  console.log(" IN: toPortal");
  loadXmlForIri(iri)
  .then(res => {
    prepareZip(res.data, iri);
  })
  .catch(err => console.log(err));
};

module.exports.toPortal = toPortal;