package com.awakure.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidSettingsPlugin.class);
        registerPlugin(AndroidLocalAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
