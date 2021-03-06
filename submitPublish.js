const axios = require("axios");
const FormData = require('form-data');
const md5File = require('md5-file');
const logr = require("./logging.js");
const servicehelper = require("./utils/ServiceHelper");
const zipFolder = require("./utils/ZipHelper");
const urihelper = require("./utils/UriHelper");
const qh = require("./utils/QueueHelper");
const fh = require("./utils/FileHelper");
const fs = require("fs-extra");
const path = require("path");
const mkdirp = require("mkdirp");
const glob = require("glob");
const constants = require("./constants");
const extract = require("extract-zip");

const ACTION = 'publish';

/**
 * Extract a zip folder
 */
const unzip = (src, dest) => {
  return new Promise(function(resolve, reject) {
    extract(src, {dir: dest}, function(err) {
      if (err) reject(err);
      else resolve(true);
    })
  });
}

/**
 * Computes the MD5 checksum of a file
 */
const computeMD5 = (filepath) => {
  return new Promise(function(resolve, reject) {
    md5File(filepath, (err, hash) => {
      if (err) reject(err);
      else resolve(hash)
    });
  });
}

/**
 * Posts zip pkg to portal.
 */
const postToPortal = (iri, zipPath, checksum) => {
  console.log(" IN: postToPortal");
  const pubPkgApi = servicehelper.getApi("portalQProc", "pubPkg");
  const {url, method} = pubPkgApi;

  let data = new FormData();
  data.append('iri', iri);
  data.append('checksum', checksum);
  data.append('zipFile', fs.createReadStream(zipPath));

  return axios({
    method: method,
    url: url,
    data: data,
    headers: data.getHeaders()
  });
}

/**
 * Post Package and publish status
 */
const postPkg = (iri, zipPath) => {
  console.log(" IN: postPkg");
  computeMD5(zipPath)
  .then(res => postToPortal(iri, zipPath, res))
  .then((res) => {
    (res.data.success)
    ? qh.publishStatus(qh.formMsg(iri, 'under_processing', res.data.success.message, ACTION))
    : qh.publishStatus(qh.formMsg(iri, 'failed', res.data.error.message, ACTION))
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Portal Q Processor', ACTION))
    console.log(err)
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
  return fh.writeFile(content, manifestPath);
}

/**
 * Extracts the IRI package recieved in the response data from editor-fe. 
 * This contains the Metadata XML and Public key (if present)
 */
const extractPkg = (data, tmpAknDir) => {
  return new Promise(function(resolve, reject) {
    const zipPath = tmpAknDir + '.zip';
    data.pipe(fs.createWriteStream(zipPath));
    data.on('end', () => {
      unzip(zipPath, path.resolve(tmpAknDir))
      .then(res => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
    });
    data.on('error', () => {
        const msg = {"status": "error", "msg": "Error while unzipping the IRI package"};
        console.log(msg);
        reject(msg);
    });
  });
}

/**
 * Copy attachments (if present) to the temp folder
 */
const copyAtt = (attSrc, attDest) => {
  return new Promise(function(resolve, reject) {
    fh.fileExists(attSrc)
    .then(res => {
      if (res) {
        //creates the parent folder 'tmp/tmpxxxx' as well as the attachment folder structure
        fh.mkdir(attDest)
        .then(res => fh.copyFiles(attSrc, attDest))
        .then(res => resolve(true))
        .catch(err => reject(err))
      } else {
        resolve(true)
      }
    })
    .catch(err => reject(err))
  });
}

/**
 * Create a temporary folder 'akn/' to hold
 * a. Doc XML
 * b. Attachments (if present)
 * c. Public key (if present)
 * We also create the attachment folder structure inside akn/
 * Create a zip folder, 'akn.zip'
 */
function prepareZip(data, iri) {
  console.log(" IN: prepareZip");
  const tmpUid = 'tmp' + getUid();
  const tmpAknDir = path.join(constants.TMP_AKN_FOLDER(), tmpUid);
  const zipPath = tmpAknDir + '.zip';

  //Remove existing folders with the same tmpUid
  fh.removeFileFolder(tmpAknDir)
  .then(res => {
    return extractPkg(data, tmpAknDir);
  })
  .then((res) => {
    //Folder structure and path for attachments
    let arrIri = iri.split("/");
    let subPath = arrIri.slice(1, arrIri.length - 1 ).join("/");
    let attDest = path.join(tmpAknDir, subPath);
    let attSrc = path.join(constants.AKN_ATT_FOLDER(), subPath);
    return copyAtt(attSrc, attDest)
  })
  .then(res => writeManifest(tmpAknDir))
  //Pass postPkg as callback on completion of zip.
  .then(res => zipFolder(tmpUid, zipPath, () => postPkg(iri, zipPath))) 
  .catch(err => {
    qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Editor Q Processor', ACTION));
    console.log(err);
  });
}

const loadPkgForIri = (iri) => {
  console.log(" IN: loadPkgForIri");
  const loadPkgApi = servicehelper.getApi("editor-fe", "loadPkg");
  const {url, method} = loadPkgApi;
  return axios({
    method: method,
    url: url,
    data: {"data": {"iri": iri, "noAtt": true}},
    responseType: 'stream'
  });
}

//Get XML, Public key (if present), Attachments, Zip and post to Portal
const toPortal = ({iri, action}) => {
  console.log(" IN: toPortal (Publish)");
  loadPkgForIri(iri)
  .then(response => {
    const contentType = response.headers['content-type'];
    if (contentType.indexOf('application/json') !== -1) {
        qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Editor Q Processor', ACTION));
        console.log("Error while loading the IRI package");
    } else {
      prepareZip(response.data, iri);
    }
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Editor Q Processor', ACTION));
    console.log(err);
  });
};

module.exports.toPortal = toPortal;