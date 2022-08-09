require("dotenv").config();
import request from "request";

let postWebhook = (req, res) =>{
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
            if (webhook_event.message) {
                 handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

function handleMessage(sender_psid, received_message) {
    if (received_message.text) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + received_message.text);
    }
    if (received_message.text === "hi") {
        let msg = {"text": `hi too`}
        callSendAPI(sender_psid, msg);
    }
}

function handlePostback(sender_psid, received_postback) {
    let payload = received_postback.payload;
    switch (payload) {
        case "GET_STARTED":
            let msg = {"text": `payload bna get started`}
            callSendAPI(sender_psid, msg);
            break;
        case "menu":
            let msg1 = {"text": `menu deer darlaa`}
            callSendAPI(sender_psid, msg1);
            break;
        case "call":
            let msg2 = {"text": `lavlah deer darlaa`}
            callSendAPI(sender_psid, msg2);
            break;
    }
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        message: response
    };
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};
