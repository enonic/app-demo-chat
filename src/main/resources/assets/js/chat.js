$(function() {
    var $chat = $('.chat');
    if ($chat.length) {
        wsConnect($chat.data('ws-url'));
        bindJoinFormSubmit();
        bindChatFormSubmit();
    }
});

function wsConnect(url) {
    ws = new WebSocket(url);
    ws.onopen = onWsOpen;
    ws.onclose = onWsClose;
    ws.onmessage = onWsMessage;
}


function onWsOpen() {
    console.log('ws open');


    var pingPeriod = 60000;
    var pingInterval = setInterval(function() { sendPing() }, pingPeriod);


/*    var req = {
        action: 'join',
        group: 'everyone'
    };

    ws.send(req);*/

}

function onWsClose() {
    console.log('ws close');
}

function onWsMessage(event) {

    console.log(event);

    var data = JSON.parse(event.data);
    //console.log(data);

    if (data.action == 'chatMessage') {
        $('.chat__list').append('<li class="chat__item">' + data.nick + ': ' + data.message + '</li>');
    }
    else if (data.action == 'joined') {
        //console.log(data.nick + ' joined');
        $('.chat__list').append('<li class="chat__item--joined">' + data.nick + ' joined the chat ' + '</li>');
    }
    else if (data.action == 'left') {
        //console.log(data.nick + ' joined');
        $('.chat__list').append('<li class="chat__item--left">' + data.nick + ' left the chat ' + '</li>');
    }
    else if (data.action == 'ping') {
        console.log('received ping');
    }
}

function joinChat(nick) {
    var req = {
        action: 'join',
        nick: nick
    };

    ws.send(JSON.stringify(req));
}

function sendChatMessage(message) {
    /*var req = {
        message: message
    };*/

    var req = {
        action: 'chatMessage',
        message: message
    };


    ws.send(JSON.stringify(req));
}

function sendPing() {
    ws.send(JSON.stringify({
        action: 'ping'
    }));
}

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

function bindChatFormSubmit() {
    $('.chat__form').submit(function(e) {

        e.preventDefault();
        sendChatMessage($('.chat__input').val());
        return false;
    });
}