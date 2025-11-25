#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛡️  Initializing IoT Honeypot Attack Simulation...${NC}"

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo -e "⚙️  First time setup: Creating virtual environment..."
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error: Failed to create virtual environment. Please install python3-venv.${NC}"
        exit 1
    fi
    
    echo -e "📦 Installing dependencies..."
    ./venv/bin/pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error: Failed to install dependencies.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Setup complete!${NC}"
fi

# Run the attacker script
echo -e "${GREEN}🚀 Launching Attack Sequence...${NC}"
./venv/bin/python attacker.py
