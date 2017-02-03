var pingIntervalId;
var avatar;
var wsResponseHandlers = {};
var morseChatInitiated = false;
var wsUrl;
var names = {
    1: 'Morse',
    2: 'Einstein',
    3: 'Tesla',
    4: 'Hopper'
};

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
        wsUrl = getWebSocketUrl($chat);
        wsConnect(wsUrl);
        bindChatJoinFormSubmit();
        bindChatMessageFormSubmit();
        bindChatMessageFormInput();
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
    var pingPeriod = 30000;
    pingIntervalId = setInterval(function() { sendPing() }, pingPeriod);

    if (avatar) {
        toggleMessageForm('enable')
        showSystemMessage('Reconnected!');
    }
}

/**
 * On WebSocket connection close
 */
function onWsClose() {
    clearInterval(pingIntervalId);
    toggleMessageForm('disable');
    showSystemMessage('Connection lost, trying to reconnect');
    // attempt to reconnect
    setTimeout(wsConnect(wsUrl), 5000);
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
        toggleMessageForm('enable');
        $('.morse-chat__message-input').focus();
    });
}

/**
 * Bind action to submit event of chat form
 */
function bindChatMessageFormSubmit() {
    $('.morse-chat__message-form').submit(function(e) {
        e.preventDefault();
        sendChatMessage($('.morse-chat__message-input').val());
        $('.morse-chat__message-input').val('');
        toggleSubmitButton('disable');
        return false;
    });
}

/**
 * Bind key up on chat form input
 * Enables submit button if not empty
 */
function bindChatMessageFormInput() {
    var $input = $('.morse-chat__message-input');
    $input.on('input', function() {
        if ($input.val().length == 0) {
            toggleSubmitButton('disable');
        }
        else {
            toggleSubmitButton('enable');
        }
    });
}

/**
 * Toggle submit button
 * @param action (enable or disable)
 */
function toggleSubmitButton(action) {
    var $submitBtn = $('.morse-chat__message-submit');
    if (action === 'enable') {
        $submitBtn.removeAttr('disabled');
    }
    else {
        $submitBtn.attr('disabled', 'disabled');
    }
}

/**
 * Toggle message form
 * @param action (enable or disable)
 */
function toggleMessageForm(action) {
    var $form = $('.morse-chat__message-form');
    if (action === 'enable') {
        $form.removeClass('morse-chat__message-form--disabled');
    }
    else {
        $form.addClass('morse-chat__message-form--disabled');
    }
}

/**
 * Show system message (currently used for reconnect messages)
 * @param message
 */
function showSystemMessage(message) {
    var $systemMessage = $('.morse-chat__item--system');
    $systemMessage.find('.morse-chat__item-message').text(message);
    $('.morse-chat__list').append($systemMessage);
    $systemMessage.show();
    scrollToBottom();
}

/**
 * Handle joined event
 * @param data
 */
wsResponseHandlers.joined = function(data) {
    var sessionIdInt = data.sessionId.replace(/\D/g,'');
    $('.morse-chat__list').append('<li class="morse-chat__item morse-chat__item--joined"><div class="morse-chat__item-avatar morse-chat__item-avatar--' + data.avatar + '"/><div class="morse-chat__item-message">' + names[data.avatar] + '-' + sessionIdInt + ' joined the chat</div></li>');
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