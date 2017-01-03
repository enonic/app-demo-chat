var libs = {
    websocket: require('/lib/xp/websocket'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    morse: require('/lib/enonic/morse-translator')
};

var users = {};

exports.webSocketEvent = handleWsEvent;
exports.get = handleGet;

/**
 * Only allow websocket requests, otherwise return 404
 * @param req
 * @returns {*}
 */
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

/**
 * Handle WebSockets event
 * @param event
 */
function handleWsEvent(event) {
    if (event.type == 'open') {
        connect(event);
    }

    if (event.type == 'message') {
        handleWsMessage(event);
    }

    if (event.type == 'close') {
        leave(event);
    }
}

/**
 * On user connect
 * Adds user to chat group
 * @param event
 */
function connect(event) {
    //sendToClient(getSessionId(event), {action: 'Connected'});
    libs.websocket.addToGroup('chat', getSessionId(event));
}

function handleWsMessage(event) {
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

function leave(event) {
    var sessionId = getSessionId(event);
    libs.websocket.removeFromGroup('chat', sessionId);
    sendToChat({
        action: 'left',
        nick: getUser(sessionId).nick
    });
    delete users[sessionId];
}

function join(event, nick) {
    var sessionId = getSessionId(event);
    users[sessionId] = {
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


/**
 * Get session id for a websockets event
 * @param event
 * @returns {string}
 */
function getSessionId(event) {
    return event.session.id;
}




/*function forwardEvent(message) {
    libs.websocket.sendToGroup('chat', JSON.stringify(message));
}*/


function handleChatMessage(event, message) {

    libs.util.log(event);
    libs.util.log(message);


    var translatedMessage = libs.morse.translate(message);
    var sessionId = getSessionId(event);

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
    libs.websocket.send(sessionId, JSON.stringify(message));
}

