const amqp = require('amqplib/callback_api');
const submitPublish = require('./submitPublish');
const submitRetract = require('./submitRetract');

/**
 * Important: mqConfig channels get set in the async calls.
 */
let mqConfig = {
  "exchange" : "editor_doc_publish",
  "IRI_Q": {
    "key": "iriQ",
    "channel": {}
  },
  "STATUS_Q": {
    "key": "statusQ",
    "channel": {}
  }
}
 
function bail(err) {
  console.error(err);
  process.exit(1);
}

function getExchange() {
  return mqConfig.exchange;
}

function getChannel(qName) {
  return mqConfig[qName].channel;
}

function setChannel(qName, ch) {
  mqConfig[qName].channel = ch;
}

function getQKey(qName) {
  return mqConfig[qName].key;
}
 
// Publisher
function publisherStatusQ(conn) {
  const qName = 'STATUS_Q'; //Will be changed to STATUS_Q
  const ex = getExchange();
  const key = getQKey(qName);

  conn.createChannel(onOpen);
  function onOpen(err, channel) {
    if (err != null) bail(err);
    setChannel(qName, channel);
    channel.assertExchange(ex, 'direct', {durable: true});
    console.log(" %s publisher channel opened", qName);

    //Test Message
    // let msg = 'Hello World!';
    // let msg = "/akn/ke/act/legge/1970-06-03/Cap_44/eng@/!main";
    // channel.publish(ex, key, new Buffer(msg));
    // console.log(" [x] Sent %s: '%s'", key, msg);
  }
}

// Dispatches the IRI to the function based on action : publish or retract 
function dispatch(qObj) {
  const {action} = qObj;
  if (action === 'publish') {
    submitPublish.toPortal(qObj);
  } else if (action === 'retract') {
    submitRetract.toPortal(qObj);
  }
}
 
// Consumer
function consumerIriQ(conn) {
  const qName = 'IRI_Q';
  const ex = getExchange();
  const key = getQKey(qName);

  conn.createChannel(onOpen);
  function onOpen(err, channel) {
    if (err != null) bail(err);
    channel.assertExchange(ex, 'direct', {durable: true});
    channel.assertQueue('editor_iri_q', {exclusive: false, durable: true}, function(err, q) {
      console.log(" %s consumer channel opened.", qName);
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
      channel.bindQueue(q.queue, ex, key);
      channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
        dispatch(JSON.parse(msg.content.toString()));
      }, {noAck: true});

      //For standalone testing only
      // publisherStatusQ(conn);
    });
  }
}
 
const rabbit = amqp.connect('amqp://localhost', function(err, conn) {
  console.log(" AMQP CONNECTED");
  if (err != null) bail(err);
  consumerIriQ(conn);
  publisherStatusQ(conn);
});

module.exports = {
    rabbit: rabbit,
    getExchange: getExchange,
    getChannel: getChannel,
    getQKey: getQKey
};