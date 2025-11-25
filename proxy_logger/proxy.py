import socket
import threading
import time
import logging
import os

# Configuration
LISTEN_HOST = '0.0.0.0'
LISTEN_PORT = 1884
TARGET_HOST = 'mqtt-broker'
TARGET_PORT = 1883
LOG_FILE = '/logs/proxy.log'

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

def handle_client(client_socket):
    target_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        target_socket.connect((TARGET_HOST, TARGET_PORT))
    except Exception as e:
        logging.error(f"Could not connect to target {TARGET_HOST}:{TARGET_PORT} - {e}")
        client_socket.close()
        return

    def forward(src, dst, direction):
        try:
            while True:
                data = src.recv(4096)
                if not data:
                    break
                
                # Log payload if it's from client to broker (potential attack/publish)
                if direction == "C->B":
                    logging.info(f"Payload captured: {data}")
                    # TODO: Parse MQTT packet to extract topic/message for better logging
                
                dst.sendall(data)
        except Exception as e:
            pass
        finally:
            src.close()
            dst.close()

    client_to_target = threading.Thread(target=forward, args=(client_socket, target_socket, "C->B"))
    target_to_client = threading.Thread(target=forward, args=(target_socket, client_socket, "B->C"))

    client_to_target.start()
    target_to_client.start()

def start_proxy():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((LISTEN_HOST, LISTEN_PORT))
    server.listen(5)
    logging.info(f"Proxy listening on {LISTEN_HOST}:{LISTEN_PORT}, forwarding to {TARGET_HOST}:{TARGET_PORT}")

    while True:
        client_socket, addr = server.accept()
        logging.info(f"Accepted connection from {addr[0]}:{addr[1]}")
        client_handler = threading.Thread(target=handle_client, args=(client_socket,))
        client_handler.start()

if __name__ == '__main__':
    # Ensure log directory exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    start_proxy()
