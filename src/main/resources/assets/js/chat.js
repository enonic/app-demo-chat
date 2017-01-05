var pingIntervalId;
var sessionId;
var avatar;
var wsResponseHandlers = {};

/**
 * On document ready
 */
$(function() {
    var $chat = $('.chat');
    if ($chat.length) {
        wsConnect($chat.data('ws-url'));
        bindChatJoinFormSubmit();
        bindChatMessageFormSubmit();
    }
});

/**
 * Connect to WebSocket service
 * @param url
 */
function wsConnect(url) {
    ws = new WebSocket(url);
    ws.onopen = onWsOpen;
    ws.onclose = onWsClose;
    ws.onmessage = onWsMessage;
}

/**
 * On WebSocket connection open
 */
function onWsOpen() {
    // Ping period in milliseconds
    var pingPeriod = 60000;
    pingIntervalId = setInterval(function() { sendPing() }, pingPeriod);
}

/**
 * On WebSocket connection close
 */
function onWsClose() {
    clearInterval(pingIntervalId);
    // attempt to reconnect
    setTimeout(wsConnect, 2000);
}

/**
 * On WebSocket message received
 * @param event
 */
function onWsMessage(event) {
    var data = JSON.parse(event.data);
    var handler = wsResponseHandlers[data.action];
    if (handler) {
        handler(data);
    }
}

/**
 * Join chat room
 * @param avatar
 */
function joinChat(avatar) {
    var req = {
        action: 'join',
        avatar: avatar
    };

    ws.send(JSON.stringify(req));
}

/**
 * Send chat message
 * @param message
 */
function sendChatMessage(message) {
    var req = {
        action: 'chatMessage',
        message: message,
        avatar: avatar
    };

    ws.send(JSON.stringify(req));
}

/**
 * Send Ping to server to keep connection alive
 */
function sendPing() {
    ws.send(JSON.stringify({
        action: 'ping'
    }));
}

/**
 * Bind action to submit event of join form
 */
function bindChatJoinFormSubmit() {
    $('.chat__join-input').change(function(e) {
        avatar = $(this).val();
        joinChat(avatar);
        $('.chat__join-form').hide();
        $('.chat__joined').show();
    });
}

/**
 * Bind action to submit event of chat form
 */
function bindChatMessageFormSubmit() {
    $('.chat__message-form').submit(function(e) {
        e.preventDefault();
        sendChatMessage($('.chat__message-input').val());
        return false;
    });
}

/**
 * Handle joined event
 * @param data
 */
wsResponseHandlers.joined = function(data) {
    $('.chat__list').append('<li class="chat__item chat__item--joined"><div class="chat__item-avatar chat__item-avatar--' + data.avatar + '"/><div class="chat__item-message">' + data.sessionId + ' joined the chat</div></li>');
};

/**
 * Handle left event
 * @param data
 */
wsResponseHandlers.left = function(data) {
    $('.chat__list').append('<li class="chat__item chat__item--left"><div class="chat__item-message">' + data.sessionId + ' left the chat</div></li>');
};

/**
 * Handle chatMessage event
 * @param data
 */
wsResponseHandlers.chatMessage = function(data) {
    $('.chat__list').append('<li class="chat__item"><div class="chat__item-avatar chat__item-avatar--' + data.avatar + '"/><div class="chat__item-message">' + data.message + '</div></li>');
};
