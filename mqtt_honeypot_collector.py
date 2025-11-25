import time
import paho.mqtt.client as mqtt

# ===== Broker info =====
broker = 'mqtt-broker'  # Docker service name
port = 1883             # Container port

# ===== Callbacks =====
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("#")  # Subscribe to all topics

def on_message(client, userdata, msg):
    print(f"Message arrived [{msg.topic}]: {msg.payload.decode()}")

# ===== MQTT client setup =====
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# ===== Connect loop =====
while True:
    try:
        client.connect(broker, port, 60)
        break
    except:
        print('Waiting for broker...')
        time.sleep(2)

client.loop_forever()  # Start listening for messages

