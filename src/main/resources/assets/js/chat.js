var pingIntervalId;
var sessionId;

$(function() {
    var $chat = $('.chat');
    if ($chat.length) {
        wsConnect($chat.data('ws-url'));
        bindJoinFormSubmit();
        bindChatFormSubmit();
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
    //console.log(data);

    if (data.action == 'chatMessage') {
        $('.chat__list').append('<li class="chat__item">' + data.nick + ': ' + data.message + '</li>');
    }
    else if (data.action == 'joined') {
        $('.chat__list').append('<li class="chat__item chat__item--joined">' + data.nick + ' joined the chat ' + '</li>');
    }
    else if (data.action == 'left') {
        $('.chat__list').append('<li class="chat__item chat__item--left">' + data.nick + ' left the chat ' + '</li>');
    }
    else if (data.action == 'ping') {
        console.log('received ping');
    }





}

/**
 * Join chat room
 * @param nick
 */
function joinChat(nick) {
    var req = {
        action: 'join',
        nick: nick
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
        message: message
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
function bindJoinFormSubmit() {
    $('.chat__join-form').submit(function(e) {
        e.preventDefault();

        var nick = $('.chat__input--nick').val();

        joinChat(nick);

        $(this).hide();

        $('.chat__joined').show();

        return false;
    });
}

/**
 * Bind action to submit event of chat form
 */
function bindChatFormSubmit() {
    $('.chat__form').submit(function(e) {

        e.preventDefault();
        sendChatMessage($('.chat__input').val());
        return false;
    });
}