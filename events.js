define(function() {

    function addHandlerOnEvent(handler, miid, eventName) {

        var self = this;

        // if the handler is a module function name as string
        if (typeof handler === "string" && typeof self[handler] === "function") {
            self.on(eventName, miid, function(data) {
                self[handler].call(self, data);
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
                        if (typeof self[name] === "function") {
                            var allArgs = [];
                            for (var i in args) {
                                allArgs.push(args[i]);
                            }
                            for (var i in arguments) {
                                allArgs.push(arguments[i]);
                            }
                            self[name].apply(self, allArgs);
                        }
                        continue;
                    }

                    // this step is an event emit
                    if (step.emit) {
                        self.emit(step.emit, data);
                        continue;
                    }
                }
            });

            return;
        }
    }

    return function(config) {

        var self = this;

        // process only the listen property in the configurations
        for (var miid in config.listen) {

            var miidEvents = config.listen[miid];

            for (var eventName in miidEvents) {
                addHandlerOnEvent.call(self, miidEvents[eventName], miid, eventName);
            }
        }
    }
});
