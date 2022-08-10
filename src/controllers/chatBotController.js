require("dotenv").config();
import request from "request";

let postWebhook = (req, res) =>{
    // Parse the request body from the POST
    let body = req.body;
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

async function handleMessage(sender_psid, received_message) {
    await markMessageSeen(sender_psid);
    await sendTypingOn(sender_psid);
    if (received_message.text === "hi") {
        let msg1 = {"text": `Сайн байна уу? Та дараах цэснээс сонголтоо хийнэ үү`}
        let msg2 = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Menu 1",
                                "image_url": "https://images.unsplash.com/photo-1659458388439-c08fd1d32695?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
                                "subtitle": "We have the right hat for everyone.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://ddishtv.mn/",
                                        "title": "View Website"
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Start Chatting",
                                        "payload": "sub_menu1"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        await sendMessage(sender_psid, msg1);
        await sendMessage(sender_psid, msg2);
    }
}

async function handlePostback(sender_psid, received_postback) {
    await markMessageSeen(sender_psid);
    await sendTypingOn(sender_psid);
    let payload = received_postback.payload;
    switch (payload) {
        case "GET_STARTED":
            let msg = {"text": `payload bna get started`}
            await sendMessage(sender_psid, msg);
            break;
        case "menu":
            let msg1 = {"text": `menu deer darlaa`}
            await sendMessage(sender_psid, msg1);
            break;
        case "call":
            // let msg2 = {"text": `lavlah deer darlaa`}
            await sendMessage(sender_psid, `lavlah deer darlaa`);
            break;
    }
}

let sendMessage = (sender_psid, response) => {
    return new Promise(async (resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response,
            };
            // Send the HTTP request to the Messenger Platform
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
                    resolve('done!')
                } else {
                    console.log("MESSAGE ILGEEHED ALDAA GARLAA" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};
let sendTypingOn = (sender_psid) => {
    return new Promise ((resolve, reject) => {
        try{
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action":"typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": process.env.FB_PAGE_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    console.log("SEND TYPING ON ALDAA GARLAA" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};
let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action":"mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": process.env.FB_PAGE_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    console.log("MESSAGE SEENDEHED ALDAA GARLAA" + err);
                }
            });
        }catch (e) {
            reject(e);
        }
    });
};

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook,
    sendTypingOn:sendTypingOn,
    markMessageSeen:markMessageSeen
};
