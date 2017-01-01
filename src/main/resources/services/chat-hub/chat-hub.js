var libs = {
    websocket: require('/lib/xp/websocket'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    morse: require('/lib/enonic/morse-translator')
};

var users = {};

exports.webSocketEvent = handleEvent;
exports.get = handleGet;

function handleGet(req) {

    if (!req.webSocket) {
        return {
            status: 404
        };
    }

    return {
        webSocket: {
            data: {}
        }
    };
}

function handleEvent(event) {

    if (event.type == 'open') {
        sendToClient(getId(event), {action: 'Connected'});
        libs.websocket.addToGroup('chat', getId(event));
    }

    if (event.type == 'message') {
        handleMessage(event);
    }

    if (event.type == 'close') {
        leave(event);
    }
}

function join(event, nick) {
    var id = getId(event);
    users[id] = {
        nick: nick
    };
    sendToChat({
        action: 'joined',
        nick: nick
    });
}

/**
 * Get user by session id
 * @param sessionId
 * @returns {*}
 */
function getUser(sessionId) {
    return users[sessionId];
}


function leave(event) {
    var id = getId(event);
    libs.websocket.removeFromGroup('chat', id);
    sendToChat({
        action: 'left',
        nick: getUser(id).nick
    });
}

function getId(event) {
    return event.session.id;
}

function handleMessage(event) {
    var message = JSON.parse(event.message);

    if (message.action == 'join') {
        libs.util.log(event);
        join(event, message.nick);
        return;
    }

    if (message.action == 'chatMessage') {
        handleChatMessage(event, message.message);
        return;
    }

    if (message.action == 'ping') {
        libs.util.log(event);
        return;
    }

    //libs.util.log(message);


    //var translatedMessage = libs.morse.translate(message);

    //libs.util.log(translatedMessage);


    //message = JSON.parse(translatedMessage);




    //return forwardEvent(translatedMessage);
}


/*function forwardEvent(message) {
    libs.websocket.sendToGroup('chat', JSON.stringify(message));
}*/


function handleChatMessage(event, message) {

    libs.util.log(event);
    libs.util.log(message);


    var translatedMessage = libs.morse.translate(message);
    var sessionId = getId(event);

    var req = {
        action: 'chatMessage',
        id: sessionId,
        nick: getUser(sessionId).nick,
        message: translatedMessage
    };


    sendToChat(req);
}

/**
 * Send to all users
 * @param req
 */
function sendToChat(req) {
    libs.websocket.sendToGroup('chat', JSON.stringify(req));
}

/**
 * Send message to single user
 * @param sessionId
 * @param message
 */
function sendToClient(sessionId, message) {
    var msg = JSON.stringify(message);
    libs.websocket.send(sessionId, msg);
}

