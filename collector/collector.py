import time
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect('mqtt-broker', 1883, 60)
while True:
    client.loop()
    time.sleep(1)
