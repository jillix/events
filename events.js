// dependencies
var Utils = require ("github/jxmono/utils");

function removeHandlerOnEvent (handlerObj, miid, eventName) {
    var self = this;
    self.off(eventName, miid, handlerObj[eventName]);
}

function addHandlerOnEvent (handlerObj, miid, eventName) {

    var self = this;

    // if the handler is a module function name as string
    if (typeof handlerObj[eventName] === "string") {

        var fooName = handlerObj[eventName];

        // the function must be saved for later fo uninits
        handlerObj[eventName] = function() {

            // find function
            var handlerFunction = Utils.findFunction (self, fooName) || Utils.findFunction (window, fooName);

            // return if function doesn't exist
            if (!handlerFunction) { return; }

            // call function
            handlerFunction.apply(self, arguments);
        };

        // on event name
        self.on(eventName, miid, handlerObj[eventName]);

        return;
    }

    // else it must be an array of objects
    if (handlerObj[eventName].length) {

        var steps = handlerObj[eventName];

        // the function must be saved for later fo uninits
        handlerObj[eventName] = function() {
            for (var i = 0; i < steps.length; ++i) {
                var step = steps[i];

                // this step is a handler function
                if (step.handler) {
                    var handlerName = step.handler;
                    var configArgs = [];

                    if (typeof step.handler === "object") {
                        handlerName = step.handler.name;
                        configArgs = step.handler.args || [];
                    }

                    var handlerFunction = Utils.findFunction (self, handlerName) || Utils.findFunction (window, handlerName);
                    if (typeof handlerFunction === "function") {
                        var allArgs = [];
                        // first we push the fixed (application.json arguments)
                        for (var ii = 0; ii < configArgs.length; ++ii) {
                            allArgs.push(configArgs[ii]);
                        }
                        // then come the dynamic ones from the emit arguments (data context, callback, etc.)
                        for (var ii = 0, l = arguments.length; ii < l; ++ii) {
                            allArgs.push(arguments[ii]);
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
                    for (var ii = 0, l = arguments.length; ii < l; ++ii) {
                        configArgs.push(arguments[ii]);
                    }

                    var allArgs = [];
                    allArgs.push(eventName);
                    for (var ii = 0; ii < configArgs.length; ++ii) {
                        allArgs.push(configArgs[ii]);
                    }

                    self.emit.apply(self, allArgs);
                }
            }
        };

        self.on(eventName, miid, handlerObj[eventName]);

        return;
    }
}

module.exports = function(config, uninit) {

    var self = this;

    // process only the listen property in the configurations
    for (var miid in config.listen) {
        if (!config.listen.hasOwnProperty(miid)) continue;

        var miidEvents = config.listen[miid];

        for (var eventName in miidEvents) {
            if (!miidEvents.hasOwnProperty(eventName)) continue;

            var foo = uninit ? removeHandlerOnEvent : addHandlerOnEvent;
            foo.call(self, miidEvents, miid, eventName);
        }
    }
};
