from paho.mqtt import client as mqtt_client
import logging; logging.basicConfig(filename='/app/collected_data.log', level=logging.INFO, format='%(asctime)s %(message)s')
import time
import paho.mqtt.client as mqtt
broker='mqtt-broker'
port=1883
client=mqtt.Client(client_id='collector', protocol=mqtt.MQTTv5, userdata=None)
while True:
    try:
        client.connect(broker, port, 60)
        break
    except:
        print('Waiting for broker...')
        time.sleep(2)
