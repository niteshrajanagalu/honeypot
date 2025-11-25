FROM python:3.10-slim

WORKDIR /app

COPY proxy.py .

# Create logs directory
RUN mkdir -p /logs

CMD ["python", "-u", "proxy.py"]
