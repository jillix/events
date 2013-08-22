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
    if (typeof handler === "string" && typeof self[handler] === "function") {
        self.on(eventName, miid, function() {
            self[handler].apply(self, arguments);
        });
        return;
    }

    // else it must be an array of objects
    if (handler.length) {
        self.on(eventName, miid, function() {
            for (var i in handler) {
                var step = handler[i];

                // this step is a handler function
                if (step.handler) {
                    var name = null;
                    var args = [];

                    switch (typeof step.handler) {
                        case "object":
                            name = step.handler.name;
                            args = step.handler.args || [];
                            break;
                        case "string":
                            name = step.handler;
                            break;
                    }

                    var handler = findFunction(self, name) || findFunction(window, name);
                    if (typeof handler === "function") {
                        var allArgs = [];
                        // first we push the fixed (application.json arguments)
                        for (var i in args) {
                            allArgs.push(args[i]);
                        }
                        // then come the dynamic ones from the emit arguments (data context, callback, etc.)
                        for (var i = 0, l = arguments.length; i < l; ++i) {
                            allArgs.push(arguments[i]);
                        }

                        handler.apply(self, allArgs);
                    }

                    continue;
                }

                // this step is an event emit
                if (step.emit) {

                    var args = [];
                    var eventName = step.emit;

                    if (typeof step.emit === "object") {
                        eventName = step.emit.name;
                        args = step.emit.args || [];
                    }

                    // then come the dynamic ones from the emit arguments (data context, callback, etc.)
                    for (var i = 0, l = arguments.length; i < l; ++i) {
                        args.push(arguments[i]);
                    }

                    var allArgs = [];
                    allArgs.push(eventName);
                    for (var i in args) {
                        allArgs.push(args[i]);
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
}
