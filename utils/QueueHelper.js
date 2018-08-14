/**
 * Construct msg for STATUS_Q
 */
const formMsg = (iri, status, message, action) => {
  return msg = {
    "iri": iri,
    "status": status,
    "message": message,
    "action": action
  };
}

/**
 * Publish on STATUS_Q
 */
const publishStatus = (msg) => {
  console.log(" IN: publishStatus");
  console.log(msg);
  const mq = require("../queues");
  const qName = 'STATUS_Q';
  const ex = mq.getExchange();
  const key = mq.getQKey(qName);
  mq.getChannel(qName).publish(ex, key, new Buffer(JSON.stringify(msg)), {persistent: true});
  console.log(" Status dispatched to Editor-FE");
}

module.exports = {
  formMsg: formMsg,
  publishStatus: publishStatus
}