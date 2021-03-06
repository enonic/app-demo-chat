var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf: require('/lib/thymeleaf')
};

// Handle GET request
exports.get = handleGet;

function handleGet() {

    var view = resolve('morse-chat.html'); // The view to render
    var model = createModel(); // The model to send to the view

    function createModel(req) {
        var model = {};
        model.wsUrl = getWsUrl();
        model.avatars = getAvatars();
        model.chatUrl = libs.portal.pageUrl({type: 'absolute'}) + '/morse-chat';
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
    };
}