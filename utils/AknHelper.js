const appconstants = require("../constants");
const generalhelper = require("./GeneralHelper");

const getCompRef = (eId, compRefs) => {
    let ref = compRefs.filter(ref => {
        return ref.GUID.split("#").pop() == eId;
    });
    return ref[0];
};

const getComponents = (embeddedContents, compRefs) => {
    console.log(" EMBEDDED CONTENTS ", embeddedContents, compRefs);
    let compKeys = Object.keys(embeddedContents).filter(key => key == "embeddedContent");
    let components = compKeys.reduce((r, k) => r.concat(embeddedContents[k]), []);
    
    let newComponents = []; 
    components.forEach(comp => {
        let ref = getCompRef(comp.eId, compRefs);
        newComponents.push({
            index: parseInt(comp.eId.split("-").pop()),
            showAs: ref.showAs,
            iriThis: ref.src,
            origFileName: comp.origFileName,
            fileName: comp.file,
            fileType: comp.fileType,
            type: comp.type
        });
    });
    return newComponents;
};

const getAknRootDocType = (aknDoc)  => {
    for (var i=0 ; i < appconstants.AKN_DOC_TYPES.length; i++ ) {
        if (aknDoc.hasOwnProperty(appconstants.AKN_DOC_TYPES[i])) {
            return appconstants.AKN_DOC_TYPES[i];
        }
    }
    console.log("AKOMA NTOSO DOC TYPE could not be determined, falling back to doc as the doc type ");
    return "doc";
};

const getAttObject = (aknDoc) => {
  let attachments = {value: "", error: null }

  const aknTypeValue = getAknRootDocType(aknDoc);
  const xmlDoc = aknDoc[aknTypeValue];
  const embeddedContents = xmlDoc.meta.proprietary.gawati.embeddedContents;
  const compRefs = generalhelper.coerceIntoArray(xmlDoc.body.book.componentRef);
  if (embeddedContents) {
    attachments = getComponents(embeddedContents, compRefs);
  }
  return attachments;
}


module.exports.getAttObject = getAttObject;