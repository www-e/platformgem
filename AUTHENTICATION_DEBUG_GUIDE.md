# PayMob Mobile Wallet Authentication Debug Guide

## Current Issue
The mobile wallet payment is failing with a 401 "Authentication credentials were not provided" error. This suggests an issue with the PayMob API authentication.

## Debugging Steps

### 1. Test PayMob Authentication
First, test if your basic PayMob authentication is working:

```bash
# Visit this endpoint in your browser or use curl
GET http://localhost:3000/api/debug/paymob-auth
```

This will test:
- API key configuration
- Basic authentication with PayMob
- Integration ID setup

### 2. Check Environment Variables
Ensure these environment variables are properly set in your `.env.local`:

```env
PAYMOB_API_KEY="your-actual-api-key"
PAYMOB_INTEGRATION_ID_MOBILE_WALLET="your-mobile-wallet-integration-id"
PAYMOB_INTEGRATION_ID_ONLINE_CARD="your-credit-card-integration-id"
PAYMOB_IFRAME_ID="your-iframe-id"
PAYMOB_HMAC_SECRET="your-hmac-secret"
```

### 3. Verify Integration IDs
The mobile wallet integration ID must be specifically configured for mobile wallet payments in your PayMob dashboard:

1. Log into your PayMob dashboard
2. Go to Developers → Payment Integrations
3. Find your Mobile Wallet integration
4. Copy the Integration ID (should be a number like 5113429)
5. Make sure it's set in `PAYMOB_INTEGRATION_ID_MOBILE_WALLET`

### 4. Test Credit Card Payments First
Before testing mobile wallets, ensure credit card payments work:
- This will confirm your basic PayMob setup is correct
- If credit cards fail too, the issue is with basic authentication

## Fixes Applied

### 1. **Dual Approach Implementation**
- **Primary**: Direct mobile wallet API call with OTP redirect
- **Fallback**: Iframe approach using mobile wallet integration ID
- If direct API fails, system automatically falls back to iframe

### 2. **Enhanced Error Handling**
- Better error messages for authentication issues
- Detailed logging for debugging
- Specific error handling for different failure scenarios

### 3. **Authentication Debugging**
- Added debug endpoint to test PayMob authentication
- Enhanced logging to identify authentication issues
- Better error reporting with request details

### 4. **Phone Number Validation**
- Proper Egyptian phone number validation
- Automatic formatting (handles 10 and 11 digit formats)
- Real-time validation in UI

## Testing Instructions

### 1. **Test Authentication**
```bash
curl http://localhost:3000/api/debug/paymob-auth
```

Expected success response:
```json
{
  "success": true,
  "message": "PayMob authentication successful",
  "config": {
    "hasApiKey": true,
    "apiKeyLength": 64,
    "hasOnlineCardIntegration": true,
    "hasMobileWalletIntegration": true
  }
}
```

### 2. **Test Credit Card Payment**
1. Select credit card payment method
2. Complete payment flow
3. Verify it works before testing mobile wallets

### 3. **Test Mobile Wallet Payment**
1. Select mobile wallet payment method
2. Enter test phone number: `01010101010`
3. System should either:
   - Redirect to OTP verification page (preferred)
   - Show iframe with mobile wallet options (fallback)

## Common Issues and Solutions

### Issue 1: "Authentication credentials were not provided"
**Cause**: Invalid or missing API key
**Solution**: 
- Check `PAYMOB_API_KEY` in environment variables
- Verify API key is correct in PayMob dashboard
- Test with debug endpoint

### Issue 2: "Invalid integration ID"
**Cause**: Wrong mobile wallet integration ID
**Solution**:
- Check `PAYMOB_INTEGRATION_ID_MOBILE_WALLET` 
- Verify it's a number, not a string
- Confirm it's the mobile wallet integration, not credit card

### Issue 3: "Phone number not registered"
**Cause**: Phone number not registered with any mobile wallet
**Solution**:
- Use test phone number: `01010101010`
- Ensure phone number is 11 digits starting with 01
- Try different mobile wallet providers (010, 011, 012, 015)

## Expected Flow

### Successful Mobile Wallet Payment:
1. User selects mobile wallet
2. User enters phone number (01010101010)
3. System validates phone number
4. System creates PayMob order
5. System initiates mobile wallet payment
6. User is redirected to PayMob OTP page
7. User enters MPIN and OTP
8. Payment is completed
9. Webhook processes payment
10. User is enrolled in course

### Fallback Flow (if direct API fails):
1. Steps 1-4 same as above
2. Direct mobile wallet API fails
3. System creates payment key with mobile wallet integration
4. User sees iframe with mobile wallet options
5. User completes payment in iframe
6. Steps 8-10 same as above

## Next Steps

1. **Test the debug endpoint** to verify basic authentication
2. **Check environment variables** are correctly set
3. **Test credit card payments** to ensure basic setup works
4. **Try mobile wallet payment** with test phone number
5. **Check browser console** for detailed error messages
6. **Review server logs** for authentication details

If authentication still fails after these steps, the issue might be:
- Incorrect API key or integration ID
- PayMob account configuration issue
- Network/firewall blocking PayMob API calls

Contact PayMob support if basic authentication continues to fail.