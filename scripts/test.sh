#!/bin/bash

BASE_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to generate random email
generate_email() {
    echo "user_$(date +%s%N | md5sum | head -c 10)@test.com"
}

# Function to check response for errors
check_response() {
    if echo "$1" | grep -q "error\|Error\|ERROR"; then
        echo -e "${RED}Error in response: $1${NC}"
        exit 1
    fi
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Installing jq...${NC}"
    sudo apt-get install -y jq
fi

echo "🚀 Starting integration tests..."

# Generate random emails
EMAIL1=$(generate_email)
EMAIL2=$(generate_email)

# Create first user
echo -e "\n${GREEN}1. Creating first user...${NC}"
USER1_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User 1",
    "email": "'$EMAIL1'",
    "password": "123456",
    "telefone": "11999999991",
    "cpf": "'$(date +%s%N | md5sum | head -c 11)'"
  }')

check_response "$USER1_RESPONSE"
echo "User 1 created with email: $EMAIL1"

# Login first user
USER1_LOGIN=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL1'",
    "password": "123456"
  }')

USER1_TOKEN=$(echo $USER1_LOGIN | jq -r '.token')
if [ -z "$USER1_TOKEN" ] || [ "$USER1_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get token for user 1${NC}"
    exit 1
fi
echo "User 1 logged in successfully"

# Create second user
echo -e "\n${GREEN}2. Creating second user...${NC}"
USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User 2",
    "email": "'$EMAIL2'",
    "password": "123456",
    "telefone": "11999999992",
    "cpf": "'$(date +%s%N | md5sum | head -c 11)'"
  }')

check_response "$USER2_RESPONSE"
echo "User 2 created with email: $EMAIL2"

# Login second user
USER2_LOGIN=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL2'",
    "password": "123456"
  }')

USER2_TOKEN=$(echo $USER2_LOGIN | jq -r '.token')
if [ -z "$USER2_TOKEN" ] || [ "$USER2_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get token for user 2${NC}"
    exit 1
fi
echo "User 2 logged in successfully"

# # Create a dummy image file for profile picture upload test
# echo -e "\n${GREEN}3. Preparing for profile picture upload...${NC}"
# DUMMY_IMAGE_NAME="test_avatar.jpg"
# echo "dummy" > $DUMMY_IMAGE_NAME
# echo "Dummy image file created: $DUMMY_IMAGE_NAME"

# # User 1 updates profile with a picture
# echo -e "\n${GREEN}4. Updating user 1 profile with avatar...${NC}"
# UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/profile" \
#   -H "Authorization: Bearer $USER1_TOKEN" \
#   -F "name=Test User 1 Updated" \
#   -F "avatar=@$DUMMY_IMAGE_NAME")

# check_response "$UPDATE_PROFILE_RESPONSE"
# echo "User 1 profile updated successfully."
# echo "$UPDATE_PROFILE_RESPONSE" | jq '.' || echo "$UPDATE_PROFILE_RESPONSE"
# rm $DUMMY_IMAGE_NAME # Clean up dummy file

# Create a pedido with first user
echo -e "\n${GREEN}3. Creating pedido...${NC}"
PEDIDO_RESPONSE=$(curl -s -X POST "$BASE_URL/pedidos" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test Pedido",
    "descricao": "Testing pedido creation and notifications"
  }')

PEDIDO_ID=$(echo $PEDIDO_RESPONSE | jq -r '.id')
if [ -z "$PEDIDO_ID" ] || [ "$PEDIDO_ID" = "null" ]; then
    echo -e "${RED}Failed to create pedido${NC}"
    echo "$PEDIDO_RESPONSE"
    exit 1
fi
echo "Pedido created with ID: $PEDIDO_ID"

# Wait a bit for the server to process
sleep 1

# Second user shows interest
echo -e "\n${GREEN}4. Showing interest in pedido...${NC}"
INTERESSE_RESPONSE=$(curl -s -X POST "$BASE_URL/pedidos/$PEDIDO_ID/interesse" \
  -H "Authorization: Bearer $USER2_TOKEN")

check_response "$INTERESSE_RESPONSE"
echo "Interest registered successfully"

# Wait a bit for notifications to be processed
sleep 1

# Check notifications
echo -e "\n${GREEN}5. Checking notifications...${NC}"
NOTIFICATIONS=$(curl -s -X GET "$BASE_URL/notificacoes" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo "Notifications received:"
echo "$NOTIFICATIONS" | jq '.' || echo "$NOTIFICATIONS"

# Check unread count
echo -e "\n${GREEN}6. Checking unread notifications...${NC}"
UNREAD_COUNT=$(curl -s -X GET "$BASE_URL/notificacoes/nao-lidas/quantidade" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo "Unread count: $UNREAD_COUNT"

echo -e "\n${GREEN}✅ All tests completed successfully${NC}"