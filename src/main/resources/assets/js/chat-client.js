var pingIntervalId;
var avatar;
var wsResponseHandlers = {};
var morseChatInitiated = false;

/**
 * Initiate chat in web components mode (for Enonic.com demo)
 */
window.addEventListener('WebComponentsReady', function(e) {
    // imports are loaded and elements have been registered
    if (!morseChatInitiated) {
        initMorseChat();
    }
});

/**
 * Initiate chat in "direct" mode
 */
window.onload = function() {
    if (!morseChatInitiated) {
        initMorseChat();
    }
};

/**
 * Initiate chat
 */
function initMorseChat() {
    morseChatInitiated = true;
    var $chat = $('.morse-chat');
    if ($chat.length) {
        var wsUrl = getWebSocketUrl($chat);
        console.log(wsUrl);
        wsConnect(wsUrl);
        bindChatJoinFormSubmit();
        bindChatMessageFormSubmit();
    }
}

/**
 * Get url to websocket service
 * Checks if client is loaded in https mode
 * If https, secure websocket is used
 * @param $chat
 */
function getWebSocketUrl($chat) {
    var url = $chat.data('ws-url');
    var l = window.location;
    console.log(l.protocol);
    if (l.protocol === 'https:') {
        url = url.replace(/^ws:\/\//i, 'wss://');
    }
    return url;
}

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
 * Scroll to bottom of morse chat list
 */
function scrollToBottom() {
    $('.morse-chat__list')[0].scrollTop = $('.morse-chat__list')[0].scrollHeight;
}

/**
 * Bind action to submit event of join form
 */
function bindChatJoinFormSubmit() {
    $('.morse-chat__join-input').change(function(e) {
        avatar = $(this).val();
        joinChat(avatar);
        $('.morse-chat').addClass('morse-chat--joined');
    });
}

/**
 * Bind action to submit event of chat form
 */
function bindChatMessageFormSubmit() {
    $('.morse-chat__message-form').submit(function(e) {
        e.preventDefault();
        sendChatMessage($('.morse-chat__message-input').val());
        return false;
    });
}

/**
 * Handle joined event
 * @param data
 */
wsResponseHandlers.joined = function(data) {
    $('.morse-chat__list').append('<li class="morse-chat__item morse-chat__item--joined"><div class="morse-chat__item-avatar morse-chat__item-avatar--' + data.avatar + '"/><div class="morse-chat__item-message">' + data.sessionId + ' joined the chat</div></li>');
    scrollToBottom();
};

/**
 * Handle left event
 * @param data
 */
wsResponseHandlers.left = function(data) {
    $('.morse-chat__list').append('<li class="morse-chat__item morse-chat__item--left"><div class="morse-chat__item-message">' + data.sessionId + ' left the chat</div></li>');
    scrollToBottom();
};

/**
 * Handle chatMessage event
 * @param data
 */
wsResponseHandlers.chatMessage = function(data) {
    $('.morse-chat__list').append('<li class="morse-chat__item morse-chat__item--message"><div class="morse-chat__item-avatar morse-chat__item-avatar--' + data.avatar + '"/><div class="morse-chat__item-message">' + data.message + '</div></li>');
    scrollToBottom();
};

/**
 * Handle infoMessage event
 * @param data
 */
wsResponseHandlers.infoMessage = function(data) {
    $('.morse-chat__list').append('<li class="morse-chat__item morse-chat__item--info"><div class="morse-chat__item-message">' + data.message + '</div></li>');
    scrollToBottom();
};