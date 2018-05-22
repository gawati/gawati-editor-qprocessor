const axios = require("axios");
const md5File = require('md5-file')
const logr = require("./logging.js");
const servicehelper = require("./utils/ServiceHelper");
const zipFolder = require("./utils/ZipHelper");
const urihelper = require("./utils/UriHelper");
const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const glob = require("glob");
const constants = require("./constants");

//Publish on STATUS_Q
const publishStatus = (iri) => {
  const msg = {
    "iri": iri,
    "status": "under_processing"
  }

  const mq = require("./queues");
  const qName = 'STATUS_Q';
  const ex = mq.getExchange();
  const key = mq.getQKey(qName);
  mq.getChannel(qName).publish(ex, key, new Buffer(JSON.stringify(msg)));
  console.log(" Status dispatched to Editor-FE");
}

const postPkg = (iri, zipPath) => {
  console.log(" IN: postPkg");
  //Create md5 checksum
  md5File(zipPath, (err, hash) => {
    if (err) throw err
    console.log(` The MD5 sum of ${zipPath} is: ${hash}`);

    //Post to Portal
    console.log(" postPkg", iri, zipPath);

    //Publish on STATUS_Q after receiveing portal reponse.
    // publishStatus(iri);
  });
}

/**
 * Writes a given string to file.
 */
const writeFile = (docXml, filename) => {
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
    if (fs.existsSync(src)) {
      fs.copy(src, dest, function(err) {
        if (err) reject(err);
        else resolve(true);
      })
    } else {
      resolve(true);
    }
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
 * Generates a uid of length 5
 */
const getUid = () => {
  return Math.random().toString(36).substr(2, 5);
}

/**
 * Write a manifest file listing the contents of the zip folder
 */
const writeManifest = (tmpAknDir) => {
  const manifestPath = path.join(tmpAknDir, "manifest.txt");
  const files = glob.sync("**/*.*", {cwd: tmpAknDir});
  const content = files.join("\n");
  return writeFile(content, manifestPath);
}

/**
 * Create a temporary folder 'akn/' to hold
 * a. Doc XML
 * b. Attachments
 * We also create the attachment folder structure inside akn/
 * Create a zip folder, 'akn.zip'
 */
async function prepareZip(docXml, iri) {
  console.log(" IN: prepareZip");
  const tmpUid = 'tmp' + getUid();
  const tmpAknDir = path.join(constants.TMP_AKN_FOLDER(), tmpUid);
  const zipPath = tmpAknDir + '.zip';

  //Remove existing folders with the same tmpUid
  removeFileFolder(tmpAknDir)
  .then((res) => {
    //Filename for doc XML
    const xmlFilename = path.join(tmpAknDir, urihelper.fileNameFromIRI(iri, "xml"));

    //Create the folder structure for attachments
    let arrIri = iri.split("/");
    let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
    let attDest = path.join(tmpAknDir, subPath);
    let attSrc = path.join(constants.AKN_ATT_FOLDER(), subPath);

    //creates the parent folder 'tmp/tmpxxxx' as well as the attachment folder structure
    mkdirp(attDest, function(err) {
      if (err) {
        logr.error(generalhelper.serverMsg(" ERROR while creating folder "), err);
      } else {
        axios.all([writeFile(docXml, xmlFilename), copyAtt(attSrc, attDest)])
        .then(res => writeManifest(tmpAknDir))
        //Pass postPkg as callback on completion of zip.
        .then(res => zipFolder(tmpUid, zipPath, () => postPkg(iri, zipPath)))
        .catch(err => console.log(err));
      }
    });
  })
  .catch(err => console.log(err));
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