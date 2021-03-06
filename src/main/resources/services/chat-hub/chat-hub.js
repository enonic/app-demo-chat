var libs = {
    websocket: require('/lib/xp/websocket'),
    morse: require('/lib/morse-translator')
};

var chatGroup = 'chat';

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
    libs.websocket.addToGroup(chatGroup, getSessionId(event));
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
        if (message.message.toLowerCase() == 'info') {
            sendInfoMessage(event);
        }
        else {
            handleChatMessage(event, message);
        }
        return;
    }
}

/**
 * User leaves chat room
 * @param event
 */
function leave(event) {
    var sessionId = getSessionId(event);
    libs.websocket.removeFromGroup(chatGroup, sessionId);
    sendToChat({
        action: 'left',
        sessionId: sessionId
    });
}

/**
 * User joins chat room (with avatar)
 * @param event
 * @param nick
 */
function join(event, avatar) {
    var sessionId = getSessionId(event);
    sendToChat({
        action: 'joined',
        avatar: avatar,
        sessionId: sessionId
    });

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
    var translatedMessage = libs.morse.translate(message.message);
    var sessionId = getSessionId(event);

    var req = {
        action: 'chatMessage',
        id: sessionId,
        avatar: message.avatar,
        message: translatedMessage
    };

    sendToChat(req);
}

/**
 * Send to all users
 * @param req
 */
function sendToChat(req) {
    libs.websocket.sendToGroup(chatGroup, JSON.stringify(req));
}

/**
 * Send message to single user
 * @param sessionId
 * @param message
 */
function sendToClient(sessionId, message) {
    libs.websocket.send(sessionId, JSON.stringify(message));
}

/**
 * Send info message to single user
 * @param event
 */
function sendInfoMessage(event) {
    var sessionId = getSessionId(event);
    var message = 'The Morse chat uses WebSockets to relay chat messages between the clients.<br/>';
    message += 'The source code can be <a href="https://github.com/enonic/app-demo-chat/blob/master/src/main/resources/services/chat-hub/chat-hub.js" target="_blank">viewed on GitHub.</a><br/>';
    message += 'The app is also available on <a href="https://market.enonic.com/" target="_blank">Enonic Market</a>.';
    var req = {
        action: 'infoMessage',
        id: sessionId,
        message: message
    };
    sendToClient(sessionId, req);
}

