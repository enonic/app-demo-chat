var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf')
};

exports.get = handleGet;

function handleGet(req) {
    var view = resolve('chat.html');
    var model = createModel(req);

    function createModel(req) {
        var model = {};
        model.wsUrl = getWsUrl();
        model.avatars = getAvatars();
        return model;
    }

    /**
     * Get URL to WebSockets service
     * @returns {String}
     */
    function getWsUrl() {
        var url = libs.portal.serviceUrl({service: 'chat-hub', type: 'absolute'});
        url = 'ws' + url.substring(url.indexOf(':'));
        return url;
    }

    function getAvatars() {
        return [
            {id: 1, name: 'Morse'},
            {id: 2, name: 'Einstein'},
            {id: 3, name: 'Tesla'},
            {id: 4, name: 'Hopper'}
        ]
    }

    return {
        body: libs.thymeleaf.render(view, model)
    }
}