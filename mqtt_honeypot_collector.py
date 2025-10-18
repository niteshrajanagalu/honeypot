import time
import paho.mqtt.client as mqtt
broker='mqtt-broker'
port=1883
client=mqtt.Client()
while True:
    try:
        client.connect(broker, port, 60)
        break
    except:
        print('Waiting for broker...')
        time.sleep(2)
