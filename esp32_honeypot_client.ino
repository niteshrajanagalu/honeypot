#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ======= Wi-Fi Credentials =======
const char* ssid = "Airtel_Nitesh";       // Wi-Fi SSID
const char* password = "9110871521";    // Wi-Fi password

// ======= MQTT Broker =======
const char* mqtt_server = "192.168.1.9"; // Linux VM IP
const int mqtt_port = 1884;

// ======= Hardware =======
#define LED_PIN 2  // Onboard LED (GPIO2 on most ESP32 boards)

// ======= Device Info =======
String deviceId = "ESP32-" + String((uint32_t)ESP.getEfuseMac(), HEX);

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastHeartbeat = 0;
unsigned long lastPeerAnnounce = 0;
const long heartbeatInterval = 5000;  // 5 seconds
const long peerAnnounceInterval = 10000;  // 10 seconds

// ======= Function Declarations =======
void reconnectMQTT();
void blinkLED(int times, int delayMs);
void announcePeer();

// ======= Callback for MQTT Messages =======
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  String msg = "";
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  Serial.println(msg);
}

// ======= Scan Wi-Fi Networks =======
void scanNetworks() {
  Serial.println("Scanning Wi-Fi networks...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("No networks found.");
  } else {
    Serial.printf("%d networks found:\n", n);
    for (int i = 0; i < n; ++i) {
      Serial.printf("%d: %s (%d dBm) %s\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i),
                    (WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? "Open" : "");
    }
  }
  Serial.println("-----------------------");
}

// ======= Setup =======
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Scan and connect to Wi-Fi
  scanNetworks();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Wi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Device ID: ");
  Serial.println(deviceId);

  // Blink twice for success
  blinkLED(2, 300);

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  reconnectMQTT();

  // Subscribe to topic
  client.subscribe("honeypot/topic");
  
  // Announce as peer immediately
  announcePeer();
}

// ======= Main Loop =======
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long now = millis();

  // Publish heartbeat every 5 seconds
  if (now - lastHeartbeat >= heartbeatInterval) {
    lastHeartbeat = now;
    String message = "ESP32 heartbeat at " + String(now / 1000) + "s";
    client.publish("honeypot/topic", message.c_str());
    Serial.println("Published: " + message);
  }

  // Announce as peer every 10 seconds
  if (now - lastPeerAnnounce >= peerAnnounceInterval) {
    lastPeerAnnounce = now;
    announcePeer();
  }
}

// ======= Announce as Peer =======
void announcePeer() {
  StaticJsonDocument<200> doc;
  doc["node_id"] = deviceId;
  doc["status"] = "online";
  doc["timestamp"] = millis() / 1000;
  doc["ip"] = WiFi.localIP().toString();
  
  String output;
  serializeJson(doc, output);
  
  String topic = "honeypot/peers/" + deviceId;
  client.publish(topic.c_str(), output.c_str(), true);  // Retained message
  Serial.println("Announced as peer: " + output);
}

// ======= Reconnect MQTT =======
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect(deviceId.c_str())) {
      Serial.println("connected ✅");
      client.subscribe("honeypot/topic");
      announcePeer();  // Announce immediately after connecting
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5s...");
      delay(5000);
    }
  }
}

// ======= Blink LED Function =======
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}
