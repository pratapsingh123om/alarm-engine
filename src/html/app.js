// Global reference to the alarmAPI
var alarmAPI = null;
var isQtAvailable = false;
var connectionRetries = 0;
var maxRetries = 10;

// Initialize the QWebChannel
function initializeQWebChannel() {
    if (typeof qt !== 'undefined') {
        console.log("Qt WebChannel detected");
        isQtAvailable = true;
        updateDebugInfo('Qt detected');
        
        try {
            new QWebChannel(qt.webChannelTransport, function(channel) {
                console.log("QWebChannel created");
                updateDebugInfo('QWebChannel created');
                
                alarmAPI = channel.objects.alarmAPI;
                if (alarmAPI) {
                    console.log("alarmAPI object found");
                    updateDebugInfo('alarmAPI connected');
                    
                    // Connect to the alarmTriggered signal
                    if (typeof alarmAPI.alarmTriggered !== 'undefined') {
                        alarmAPI.alarmTriggered.connect(function(alarmJson) {
                            try {
                                const alarm = JSON.parse(alarmJson);
                                const time12h = formatTime12Hour(alarm.hour, alarm.minute);
                                alert(`ALARM: ${time12h.formatted} - ${alarm.label}`);
                                playAlarmSound();
                            } catch (e) {
                                console.error('Error parsing alarm JSON:', e);
                            }
                        });
                    }
                    
                    setupEventListeners();
                    refreshAlarms();
                    refreshTasks();
                } else {
                    console.error("alarmAPI object not found in channel");
                    updateDebugInfo('Error: alarmAPI not found');
                    tryFallback();
                }
            });
        } catch (e) {
            console.error('Error creating QWebChannel:', e);
            updateDebugInfo('QWebChannel error: ' + e.message);
            tryFallback();
        }
    } else if (connectionRetries < maxRetries) {
        // Retry after 1 second
        connectionRetries++;
        updateDebugInfo('Waiting for Qt... (' + connectionRetries + '/' + maxRetries + ')');
        setTimeout(initializeQWebChannel, 1000);
    } else {
        console.log("Qt WebChannel not detected - running in demo mode");
        updateDebugInfo('Demo Mode');
        setupDemoMode();
    }
}

function tryFallback() {
    if (connectionRetries < maxRetries) {
        connectionRetries++;
        updateDebugInfo('Retrying connection... (' + connectionRetries + '/' + maxRetries + ')');
        setTimeout(initializeQWebChannel, 1000);
    } else {
        console.log("Falling back to demo mode");
        updateDebugInfo('Demo Mode');
        setupDemoMode();
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, initializing...");
    updateDebugInfo('DOM loaded');
    
    // Start the initialization process
    initializeQWebChannel();
});