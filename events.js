function findValue (parent, dotNot) {

    if (!dotNot) return undefined;

    var splits = dotNot.split(".");
    var value;

    for (var i = 0; i < splits.length; i++) {
        value = parent[splits[i]];
        if (value === undefined) return undefined;
        if (typeof value === "object") parent = value;
    }

    return value;
}

function findFunction (parent, dotNot) {

    var func = findValue(parent, dotNot);

    if (typeof func !== "function") {
        return undefined;
    }

    return func;
}

function addHandlerOnEvent (handler, miid, eventName) {

    var self = this;

    // if the handler is a module function name as string
    if (typeof handler === "string") {
        var handlerFunction = findFunction(self, handler) || findFunction(window, handler);
        if (handlerFunction) {
            self.on(eventName, miid, function() {
                handlerFunction.apply(self, arguments);
            });
        }
        return;
    }

    // else it must be an array of objects
    if (handler.length) {
        self.on(eventName, miid, function() {
            for (var i = 0; i < handler.length; ++i) {
                var step = handler[i];

                // this step is a handler function
                if (step.handler) {
                    var handlerName = step.handler;
                    var configArgs = [];

                    if (typeof step.handler === "object") {
                        handlerName = step.handler.name;
                        configArgs = step.handler.args || [];
                    }

                    var handlerFunction = findFunction(self, handlerName) || findFunction(window, handlerName);
                    if (typeof handlerFunction === "function") {
                        var allArgs = [];
                        // first we push the fixed (application.json arguments)
                        for (var i = 0; i < configArgs.length; ++i) {
                            allArgs.push(configArgs[i]);
                        }
                        // then come the dynamic ones from the emit arguments (data context, callback, etc.)
                        for (var i = 0, l = arguments.length; i < l; ++i) {
                            allArgs.push(arguments[i]);
                        }

                        handlerFunction.apply(self, allArgs);
                    }

                    continue;
                }

                // this step is an event emit
                if (step.emit) {
                    var eventName = step.emit;
                    var configArgs = [];

                    if (typeof step.emit === "object") {
                        eventName = step.emit.name;
                        configArgs = step.emit.args || [];
                    }

                    // then come the dynamic ones from the emit arguments (data context, callback, etc.)
                    for (var i = 0, l = arguments.length; i < l; ++i) {
                        configArgs.push(arguments[i]);
                    }

                    var allArgs = [];
                    allArgs.push(eventName);
                    for (var i = 0; i < configArgs.length; ++i) {
                        allArgs.push(configArgs[i]);
                    }

                    self.emit.apply(self, allArgs);
                }
            }
        });

        return;
    }
}

module.exports = function(config) {

    var self = this;

    // process only the listen property in the configurations
    for (var miid in config.listen) {

        var miidEvents = config.listen[miid];

        for (var eventName in miidEvents) {
            addHandlerOnEvent.call(self, miidEvents[eventName], miid, eventName);
        }
    }
};

