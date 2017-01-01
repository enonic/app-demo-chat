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

        var wsUrl = libs.portal.serviceUrl({service: 'chat-hub', type: 'absolute'});

        wsUrl = 'ws' + wsUrl.substring(wsUrl.indexOf(':'));

        model.wsUrl = wsUrl;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    }
}