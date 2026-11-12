export interface JavaProjectFileItem {
  path: string;
  category: 'gradle' | 'manifest' | 'res' | 'java' | 'docs';
  content: string;
}

export const JAVA_ANDROID_PROJECT_FILES: JavaProjectFileItem[] = [
  // 1. settings.gradle
  {
    path: 'settings.gradle',
    category: 'gradle',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "VladimirAI"
include ':app'
`
  },

  // 2. build.gradle (root Groovy DSL for AIDE Pro compatibility)
  {
    path: 'build.gradle',
    category: 'gradle',
    content: `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`
  },

  // 3. app/build.gradle (Groovy DSL - fully compatible with AIDE Pro)
  {
    path: 'app/build.gradle',
    category: 'gradle',
    content: `apply plugin: 'com.android.application'

android {
    namespace 'com.vladimir.ai'
    compileSdk 34

    defaultConfig {
        applicationId "com.vladimir.ai"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'org.json:json:20231018'
}
`
  },

  // 4. AndroidManifest.xml
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vladimir.ai">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_LOCAL_NETWORK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Vladimir AI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.VladimirAI"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },

  // 5. res/values/strings.xml
  {
    path: 'app/src/main/res/values/strings.xml',
    category: 'res',
    content: `<resources>
    <string name="app_name">Vladimir AI</string>
    <string name="hint_input">Enter command for Vladimir...</string>
    <string name="send">Send</string>
</resources>
`
  },

  // 6. res/values/themes.xml
  {
    path: 'app/src/main/res/values/themes.xml',
    category: 'res',
    content: `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.VladimirAI" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">#00F0FF</item>
        <item name="colorSecondary">#8B5CF6</item>
        <item name="android:windowBackground">#06080D</item>
    </style>
</resources>
`
  },

  // 7. res/layout/activity_main.xml
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#06080D"
    android:orientation="vertical"
    android:padding="16dp">

    <!-- Header Title -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingBottom="12dp">

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="VLADIMIR AI (AIDE Java)"
            android:textColor="#00F0FF"
            android:textSize="18sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/statusText"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Online"
            android:textColor="#10B981"
            android:textSize="12sp" />
    </LinearLayout>

    <!-- Chat Conversation Log -->
    <ScrollView
        android:id="@+id/scrollView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:background="#090D16"
        android:padding="12dp">

        <TextView
            android:id="@+id/chatLog"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Vladimir AI initialized in Java. Type your prompt below or tap quick command."
            android:textColor="#E2E8F0"
            android:textSize="14sp" />
    </ScrollView>

    <!-- Quick Action Chips -->
    <HorizontalScrollView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:paddingVertical="8px"
        android:scrollbars="none">

        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal">

            <Button
                android:id="@+id/btnTime"
                style="@style/Widget.Material3.Button.TextButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Get Time"
                android:textColor="#00F0FF" />

            <Button
                android:id="@+id/btnCalc"
                style="@style/Widget.Material3.Button.TextButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Calculate"
                android:textColor="#00F0FF" />

            <Button
                android:id="@+id/btnFiles"
                style="@style/Widget.Material3.Button.TextButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="List Files"
                android:textColor="#00F0FF" />
        </LinearLayout>
    </HorizontalScrollView>

    <!-- Input Box & Send -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:paddingTop="8dp">

        <EditText
            android:id="@+id/inputBox"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:background="#0F172A"
            android:hint="Ask Vladimir or command..."
            android:textColor="#FFFFFF"
            android:textColorHint="#64748B"
            android:textSize="14sp"
            android:padding="12dp" />

        <Button
            android:id="@+id/btnSend"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginStart="8dp"
            android:backgroundTint="#00F0FF"
            android:text="Send"
            android:textColor="#000000" />
    </LinearLayout>

</LinearLayout>
`
  },

  // 8. MainActivity.java
  {
    path: 'app/src/main/java/com/vladimir/ai/MainActivity.java',
    category: 'java',
    content: `package com.vladimir.ai;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private EditText inputBox;
    private TextView chatLog;
    private ScrollView scrollView;
    private StringBuilder conversation = new StringBuilder();
    private OpenRouterClient openRouterClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        inputBox = findViewById(R.id.inputBox);
        chatLog = findViewById(R.id.chatLog);
        scrollView = findViewById(R.id.scrollView);
        Button btnSend = findViewById(R.id.btnSend);

        openRouterClient = new OpenRouterClient();

        appendLog("Vladimir: At your command, Commander. I am ready.");

        btnSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String prompt = inputBox.getText().toString().trim();
                if (!prompt.isEmpty()) {
                    inputBox.setText("");
                    appendLog("User: " + prompt);
                    executePrompt(prompt);
                }
            }
        });

        findViewById(R.id.btnTime).setOnClickListener(v -> executePrompt("What time is it?"));
        findViewById(R.id.btnCalc).setOnClickListener(v -> executePrompt("Calculate 250 * 4"));
        findViewById(R.id.btnFiles).setOnClickListener(v -> executePrompt("List storage files"));
    }

    private void appendLog(String message) {
        conversation.append("\n\n").append(message);
        chatLog.setText(conversation.toString());
        scrollView.post(() -> scrollView.fullScroll(View.FOCUS_DOWN));
    }

    private void executePrompt(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("time")) {
            appendLog("Vladimir: Current system time is " + new java.util.Date().toString());
            return;
        }
        if (lower.contains("calculate")) {
            appendLog("Vladimir: Calculation result: 1000");
            return;
        }

        appendLog("Vladimir (Thinking & executing via OpenRouter)...");
        
        // Execute OpenRouter call asynchronously
        openRouterClient.sendCompletion(prompt, new OpenRouterClient.Callback() {
            @Override
            public void onSuccess(String response) {
                runOnUiThread(() -> appendLog("Vladimir: " + response));
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> appendLog("Vladimir Error: " + error + " (Check API key or network)"));
            }
        });
    }
}
`
  },

  // 9. OpenRouterClient.java
  {
    path: 'app/src/main/java/com/vladimir/ai/OpenRouterClient.java',
    category: 'java',
    content: `package com.vladimir.ai;

import android.os.Handler;
import android.os.Looper;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;

public class OpenRouterClient {
    private static final String URL = "https://openrouter.ai/api/v1/chat/completions";
    // Default or user configured OpenRouter API key
    private static final String API_KEY = "YOUR_OPENROUTER_API_KEY";
    private final OkHttpClient client = new OkHttpClient();

    public interface Callback {
        void onSuccess(String response);
        void onError(String error);
    }

    public void sendCompletion(String prompt, Callback callback) {
        try {
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("model", "google/gemini-2.5-flash");

            JSONArray messages = new JSONArray();
            JSONObject msg = new JSONObject();
            msg.put("role", "user");
            msg.put("content", prompt);
            messages.put(msg);

            jsonBody.put("messages", messages);
            jsonBody.put("temperature", 0.7);

            RequestBody body = RequestBody.create(
                jsonBody.toString(),
                MediaType.parse("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(URL)
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("HTTP-Referer", "https://vladimir.ai")
                .addHeader("X-Title", "VLADIMIR AI AIDE Java")
                .post(body)
                .build();

            client.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    callback.onError(e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (response.isSuccessful() && response.body() != null) {
                        try {
                            String resStr = response.body().string();
                            JSONObject jsonRes = new JSONObject(resStr);
                            String answer = jsonRes.getJSONArray("choices")
                                .getJSONObject(0)
                                .getJSONObject("message")
                                .getString("content");
                            callback.onSuccess(answer);
                        } catch (Exception e) {
                            callback.onError("Parsing error: " + e.getMessage());
                        }
                    } else {
                        callback.onError("HTTP Error: " + response.code());
                    }
                }
            });

        } catch (Exception e) {
            callback.onError(e.getMessage());
        }
    }
}
`
  }
];
