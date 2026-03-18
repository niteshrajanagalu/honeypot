import socket
import threading
import logging
import os
import struct

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


def decode_remaining_length(data, offset):
    """Decode MQTT variable-length remaining-length field. Returns (value, new_offset)."""
    multiplier = 1
    value = 0
    while offset < len(data):
        byte = data[offset]
        offset += 1
        value += (byte & 0x7F) * multiplier
        multiplier *= 128
        if not (byte & 0x80):
            break
    return value, offset


def parse_mqtt_publish(data):
    """
    Parse an MQTT PUBLISH packet and return (topic, payload_str) or None if not a PUBLISH.
    Only handles QoS 0/1/2 PUBLISH packets (fixed header first nibble == 3).
    """
    if len(data) < 2:
        return None

    first_byte = data[0]
    packet_type = (first_byte >> 4) & 0x0F

    # 3 = PUBLISH
    if packet_type != 3:
        return None

    try:
        _, offset = decode_remaining_length(data, 1)

        # Topic length (2 bytes big-endian)
        if offset + 2 > len(data):
            return None
        topic_len = struct.unpack_from('!H', data, offset)[0]
        offset += 2

        if offset + topic_len > len(data):
            return None
        topic = data[offset:offset + topic_len].decode('utf-8', errors='replace')
        offset += topic_len

        # QoS level is bits 1-2 of first byte
        qos = (first_byte >> 1) & 0x03
        if qos in (1, 2):
            offset += 2  # skip packet identifier

        payload_bytes = data[offset:]
        payload = payload_bytes.decode('utf-8', errors='replace') if payload_bytes else ''

        return topic, payload
    except Exception:
        return None


def handle_client(client_socket, client_addr):
    target_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        target_socket.connect((TARGET_HOST, TARGET_PORT))
    except Exception as e:
        logging.error(f"Cannot connect to broker {TARGET_HOST}:{TARGET_PORT} — {e}")
        client_socket.close()
        return

    def forward(src, dst, direction):
        try:
            while True:
                data = src.recv(4096)
                if not data:
                    break

                if direction == 'C->B':
                    parsed = parse_mqtt_publish(data)
                    if parsed:
                        topic, payload = parsed
                        logging.info(
                            f"PUBLISH from {client_addr[0]}:{client_addr[1]} | "
                            f"topic={topic!r} | payload={payload!r}"
                        )
                    else:
                        # Non-PUBLISH packet (CONNECT, SUBSCRIBE, etc.) — log type only
                        ptype = (data[0] >> 4) & 0x0F if data else -1
                        ptype_names = {
                            1: 'CONNECT', 2: 'CONNACK', 3: 'PUBLISH', 4: 'PUBACK',
                            5: 'PUBREC', 6: 'PUBREL', 7: 'PUBCOMP', 8: 'SUBSCRIBE',
                            9: 'SUBACK', 10: 'UNSUBSCRIBE', 11: 'UNSUBACK',
                            12: 'PINGREQ', 13: 'PINGRESP', 14: 'DISCONNECT',
                        }
                        name = ptype_names.get(ptype, f'UNKNOWN({ptype})')
                        logging.info(f"MQTT {name} from {client_addr[0]}:{client_addr[1]}")

                dst.sendall(data)
        except Exception:
            pass
        finally:
            src.close()
            dst.close()

    t1 = threading.Thread(target=forward, args=(client_socket, target_socket, 'C->B'), daemon=True)
    t2 = threading.Thread(target=forward, args=(target_socket, client_socket, 'B->C'), daemon=True)
    t1.start()
    t2.start()


def start_proxy():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((LISTEN_HOST, LISTEN_PORT))
    server.listen(50)
    logging.info(f"Proxy listening on {LISTEN_HOST}:{LISTEN_PORT} → {TARGET_HOST}:{TARGET_PORT}")

    while True:
        client_socket, addr = server.accept()
        logging.info(f"New connection from {addr[0]}:{addr[1]}")
        t = threading.Thread(target=handle_client, args=(client_socket, addr), daemon=True)
        t.start()


if __name__ == '__main__':
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    start_proxy()
