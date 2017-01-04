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
 * Only allow WebSocket requests, otherwise return 404
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
 * Handle WebSocket event
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

/**
 * Handle WebSocket message
 * @param event
 */
function handleWsMessage(event) {
    var message = JSON.parse(event.message);

    if (message.action == 'join') {
        join(event, message.avatar);
        return;
    }

    if (message.action == 'chatMessage') {
        handleChatMessage(event, message.message);
        return;
    }

    // Just for test
    if (message.action == 'ping') {
        libs.util.log(event);
        return;
    }
}

/**
 * User leaves chat room
 * @param event
 */
function leave(event) {
    var sessionId = getSessionId(event);
    libs.websocket.removeFromGroup('chat', sessionId);
    sendToChat({
        action: 'left',
        avatar: getUser(sessionId).avatar
    });
    delete users[sessionId];
}

/**
 * User joins chat room (with avatar)
 * @param event
 * @param nick
 */
function join(event, avatar) {
    var sessionId = getSessionId(event);
    users[sessionId] = {
        avatar: avatar
    };
    sendToChat({
        action: 'joined',
        avatar: avatar,
        sessionId: sessionId
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
 * Get session id for a WebSocket event
 * @param event
 * @returns {string}
 */
function getSessionId(event) {
    return event.session.id;
}

/**
 * Handles a chat message from a client
 * Translates message into morse code, then sends this back to all users
 * @param event
 * @param message
 */
function handleChatMessage(event, message) {
    var translatedMessage = libs.morse.translate(message);
    var sessionId = getSessionId(event);

    var req = {
        action: 'chatMessage',
        id: sessionId,
        avatar: getUser(sessionId).avatar,
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

