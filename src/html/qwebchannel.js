// QWebChannel implementation for Qt WebEngine
(function(global) {
    'use strict';

    function QWebChannel(transport, initCallback) {
        if (typeof transport !== 'object' || typeof transport.send !== 'function') {
            console.error('QWebChannel: No valid transport provided.');
            return;
        }

        var channel = this;
        this.transport = transport;

        this.send = function(data) {
            if (typeof transport.send === 'function') {
                transport.send(data);
            }
        };

        this.execCallbacks = {};
        this.execId = 0;

        this.objects = {};

        this.transport.onmessage = function(message) {
            var data = message.data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            switch (data.type) {
                case 'signal':
                    if (channel.objects[data.object] && channel.objects[data.object][data.signal]) {
                        channel.objects[data.object][data.signal](data.args);
                    }
                    break;
                case 'response':
                    if (channel.execCallbacks[data.id]) {
                        channel.execCallbacks[data.id](data.data);
                        delete channel.execCallbacks[data.id];
                    }
                    break;
                case 'propertyUpdate':
                    if (channel.objects[data.object]) {
                        for (var i = 0; i < data.data.length; ++i) {
                            var prop = data.data[i];
                            channel.objects[data.object][prop.name] = prop.value;
                        }
                    }
                    break;
            }
        };

        this.exec = function(object, method, args, callback) {
            var id = ++this.execId;
            this.execCallbacks[id] = callback;
            this.send({
                type: 'invokeMethod',
                object: object,
                method: method,
                args: args,
                id: id
            });
        };

        // Initialize
        this.send({type: 'init'});
        
        if (initCallback) {
            // Simulate the alarmAPI object
            this.objects.alarmAPI = {
                getAlarms: function(callback) { channel.exec('alarmAPI', 'getAlarms', [], callback); },
                getAlarms12Hour: function(callback) { channel.exec('alarmAPI', 'getAlarms12Hour', [], callback); },
                addAlarm: function(hour, minute, label, callback) { 
                    channel.exec('alarmAPI', 'addAlarm', [hour, minute, label], callback); 
                },
                deleteAlarm: function(index, callback) { channel.exec('alarmAPI', 'deleteAlarm', [index], callback); },
                selectAudioFile: function(callback) { channel.exec('alarmAPI', 'selectAudioFile', [], callback); },
                announceTasks: function() { channel.exec('alarmAPI', 'announceTasks', []); },
                openTodoDashboard: function() { channel.exec('alarmAPI', 'openTodoDashboard', []); },
                playMusic: function(source, type) { channel.exec('alarmAPI', 'playMusic', [source, type]); },
                getSpotifyAuthUrl: function(callback) { channel.exec('alarmAPI', 'getSpotifyAuthUrl', [], callback); },
                handleSpotifyCallback: function(url, callback) { 
                    channel.exec('alarmAPI', 'handleSpotifyCallback', [url], callback); 
                }
            };
            
            initCallback(this);
        }
    }

    // Export for the web
    global.QWebChannel = QWebChannel;

    // Export for Node.js if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QWebChannel;
    }
}(window));