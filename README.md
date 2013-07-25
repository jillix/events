Mono Events Extension Module
============================

This ia an extension module the [Mono web framework](https://github.com/jillix/mono). The Event module is used by other
Mono modules (like the [layout module](https://github.com/jillix/bind-layout)) to add the Mono event support in their
configurations.

Requirements and Dependencies
-----------------------------

This module is built only on top of the Mono client library (M.js) and has no further dependencies. 

Usage
-----

Module that need Mono event support in their configurations need to:

1. add this module as a dependency in their `mono.json` descriptor ([example](https://github.com/jillix/bind-layout/blob/561a8c3aa31084094b4cd8476821925e78a59ca0/mono.json#L9)):

```json
{
    …
    "dependencies": [
        …
        "github/jillix/events/v0.1.1",
        …
    ],
    …
}
```

2. require this module in their client scripts ([example](https://github.com/jillix/bind-layout/blob/561a8c3aa31084094b4cd8476821925e78a59ca0/layout.js#L4)):

```javascript
var Events = require('github/jillix/events');
```

3. somewhere in the code (most often seen in the initialization function) call the `Events` function in the scope of
`this` module, passing it the configuration ([example](https://github.com/jillix/bind-layout/blob/561a8c3aa31084094b4cd8476821925e78a59ca0/layout.js#L25)):

```javascript
var Events = require('github/jillix/events');
```

Added Configuration
-------------------

This module extends a module's configuration with the `listen` key.

```json
{
    "listen": {
        "miid1": {
            "event1FromMiid1": [ … ],
            "event2FromMiid1": [ … ]
        },
        "miid2": {
            "eventFromMiid2": [ … ]
        }
    }
}
```

where:

  * **listen**: is an object that has as keys the `miid`'s of the module to listen to and values **event objects**
  * **event object**: is an objectt that has as keys the event names emitted by a module and as values **action arrays**
  * **action array**: is an array of **action objects** to take (in order) when the particular event is received
  * **acction object**: has as key one of: `handler`, `event`
    * `handler` actions can have as value either a **string** (a function name to be called) or an **object**
if fixed parameters need to be passed to the handler function (see example below)
    * `emit` actions have as value a **string** (an event to be emitted)

```json
{
    "listen": {
        "miid": {
            "eventFromMiid": [
                { "handler": "aFunctionInMiid1" },
                { "handler": { "name": "anotherFunctionInMiid1", "args": ["fixed argument"] } },
                { "emit": "anotherEvent" }
            ]
        }
    }
}
```

