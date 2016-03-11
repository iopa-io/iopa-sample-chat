var callbacks = {};
var counter = 0;

function ipc(socket, cb){
     this.events = {};
      
    this._socket = socket;
    this.window = {};
    var self = this;
    socket.onopen    = function()  {
      console.log('new socket connection');
      self.window.webContents = new WebContents(socket);
      cb();
    }
    
    socket.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        
        if (msg.type === 'ipc-reply'){
          var id = msg.id;
          callbacks[id].call(self, msg.data);
          delete callbacks[id];
        } else
        {
          self.emit(msg.type, msg.data);
        }
    };
    
    socket.onclose   = function()  {
        console.log('socket closed'); 
        };
 }

module.exports = ipc

ipc.prototype.send = function (eventType, data) {
  this._socket.send(JSON.stringify({type: eventType, data: data}))
}

ipc.prototype.sendSync = function (eventType, data) {
   throw("sync not implemented use .sendAsync");
}

ipc.prototype.sendAsync = function (eventType, data, callback) {
    if (typeof data === 'function')
      {
          callback = data;
          data = null;
      }
  var id = "i" + counter++;
  callbacks[id] = callback;
   this._socket.send(JSON.stringify({replyid: id, type: eventType, data: data}));
  
  // TO DO: expire callback table entry in case of non response
}


ipc.prototype.close = function () {
  this._socket.close()
}


function WebContents(conn){
  this._conn = conn;
}

WebContents.send = function(eventType, data) {
  this._conn.write(JSON.stringify({type: eventType, data: data}))
}

module.exports = ipc;


//EVENTEMITTER


/* Polyfill indexOf. */
var indexOf;

if (typeof Array.prototype.indexOf === 'function') {
    indexOf = function (haystack, needle) {
        return haystack.indexOf(needle);
    };
} else {
    indexOf = function (haystack, needle) {
        var i = 0, length = haystack.length, idx = -1, found = false;

        while (i < length && !found) {
            if (haystack[i] === needle) {
                idx = i;
                found = true;
            }

            i++;
        }

        return idx;
    };
};


ipc.prototype.on = function (event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }

    this.events[event].push(listener);
};

ipc.prototype.removeListener = function (event, listener) {
    var idx;

    if (typeof this.events[event] === 'object') {
        idx = indexOf(this.events[event], listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

ipc.prototype.emit = function (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

ipc.prototype.once = function (event, listener) {
    this.on(event, function g () {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};


