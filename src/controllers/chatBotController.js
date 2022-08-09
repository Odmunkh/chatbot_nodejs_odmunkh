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
    if (received_message.text === "hi") {
        callSendAPI(sender_psid, `hi too`);
    }
}

function handlePostback(sender_psid, received_postback) {
    let payload = received_postback.payload;
    switch (payload) {
        case "GET_STARTED":
            callSendAPI(sender_psid, `payload bna get started`);
            break;
        case "menu":
            callSendAPI(sender_psid, `menu deer darlaa`);
            break;
        case "call":
            callSendAPI(sender_psid, `lavlah deer darlaa`);
            break;
    }
}

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response,
    };
    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": {"access_token": process.env.FB_PAGE_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(res)
        console.log(body)
        if (!err) {
            console.log("message sent!");
            // resolve('done!')
        } else {
            console.log("MESSAGE ILGEEHED ALDAA GARLAA" + err);
        }
    });
}

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};
