#!/bin/bash

# Backend Authentication Bug Reproduction Script
# This script demonstrates that /auth/email/admin/users endpoints reject
# valid bearer tokens that other admin endpoints accept.

echo "=========================================="
echo "Backend Authentication Bug Reproduction"
echo "=========================================="
echo ""

# Step 1: Login and get token
echo "Step 1: Logging in to get access token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4444/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Response:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo ""

# Step 2: Test /teams endpoint (should work)
echo "Step 2: Testing /teams endpoint with bearer token..."
TEAMS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4444/teams/)

HTTP_CODE=$(echo "$TEAMS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
TEAMS_BODY=$(echo "$TEAMS_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /teams/ endpoint works (HTTP $HTTP_CODE)"
else
  echo "❌ /teams/ endpoint failed (HTTP $HTTP_CODE)"
  echo "Response: $TEAMS_BODY"
fi
echo ""

# Step 3: Test /tokens endpoint (should work)
echo "Step 3: Testing /tokens endpoint with bearer token..."
TOKENS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4444/tokens)

HTTP_CODE=$(echo "$TOKENS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
TOKENS_BODY=$(echo "$TOKENS_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /tokens endpoint works (HTTP $HTTP_CODE)"
else
  echo "❌ /tokens endpoint failed (HTTP $HTTP_CODE)"
  echo "Response: $TOKENS_BODY"
fi
echo ""

# Step 4: Test /rbac/roles endpoint (should work)
echo "Step 4: Testing /rbac/roles endpoint with bearer token..."
ROLES_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4444/rbac/roles)

HTTP_CODE=$(echo "$ROLES_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
ROLES_BODY=$(echo "$ROLES_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /rbac/roles endpoint works (HTTP $HTTP_CODE)"
else
  echo "❌ /rbac/roles endpoint failed (HTTP $HTTP_CODE)"
  echo "Response: $ROLES_BODY"
fi
echo ""

# Step 5: Test /auth/email/admin/users endpoint (BUG: should work but doesn't)
echo "Step 5: Testing /auth/email/admin/users endpoint with bearer token..."
USERS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4444/auth/email/admin/users)

HTTP_CODE=$(echo "$USERS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
USERS_BODY=$(echo "$USERS_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /auth/email/admin/users endpoint works (HTTP $HTTP_CODE)"
else
  echo "❌ BUG CONFIRMED: /auth/email/admin/users endpoint failed (HTTP $HTTP_CODE)"
  echo "Response: $USERS_BODY"
  echo ""
  echo "This endpoint rejects the same bearer token that works for:"
  echo "  - /teams/"
  echo "  - /tokens"
  echo "  - /rbac/roles"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo "The /auth/email/admin/users endpoint has different authentication"
echo "validation logic than other admin endpoints, causing it to reject"
echo "valid bearer tokens."