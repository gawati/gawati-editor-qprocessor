const axios = require("axios");
const servicehelper = require("./utils/ServiceHelper");
const qh = require("./utils/QueueHelper");

const ACTION = 'retract';

//Post Iri to be retracted to Portal
const toPortal = ({iri, action}) => {
  console.log(" IN: toPortal (Retract)");
  const retractPkgApi = servicehelper.getApi("portalQProc", "retractPkg");
  const {url, method} = retractPkgApi;
  const data = {iri, action};

  axios({
    method: method,
    url: url,
    data: {data}
  })
  .then(res => {
    (res.data.success)
    ? qh.publishStatus(qh.formMsg(iri, 'under_retraction', res.data.success.message, ACTION))
    : qh.publishStatus(qh.formMsg(iri, 'failed', res.data.error.message, ACTION))
  })
  .catch((err) => {
    qh.publishStatus(qh.formMsg(iri, 'failed', 'Error on Editor Q Processor', ACTION));
    console.log(err);
  });
};

module.exports.toPortal = toPortal;