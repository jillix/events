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
            self.on(eventName, miid, function(data) {
                for (var i in handler) {
                    var step = handler[i];

                    // this step is a handler function
                    if (step.handler) {
                        if (typeof self[step.handler] === "function") {
                            self[step.handler].call(self, data);
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
