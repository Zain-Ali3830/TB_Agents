# Module: Payments

> Fill in this file with domain knowledge about the payments feature.

## Overview

<!-- What does this module do? Who uses it? What payment provider is used? -->

## Payment Flow

1. User navigates to checkout
2. Selects payment method
3. Enters card details (or uses saved method)
4. Confirms order
5. On success: order confirmation page shown
6. On failure: error message shown, user can retry

## Key Selectors (if known)

| Element | Selector |
|---------|---------|
| Card number | `<!-- update -->` |
| Expiry | `<!-- update -->` |
| CVV | `<!-- update -->` |
| Pay button | `<!-- update -->` |

## Test Card Numbers (Stripe / provider)

| Card | Number | Purpose |
|------|--------|---------|
| Visa (success) | `4242 4242 4242 4242` | Happy path |
| Decline | `4000 0000 0000 0002` | Test failure |
| Insufficient funds | `4000 0000 0000 9995` | Test error state |

> Use expiry `12/34` and any 3-digit CVV for test cards.

## Safety Rules for This Module

- **Never use real card numbers**
- **Never submit payments that would charge real money**
- All payment tests must run against the test/sandbox environment only
- Flag and skip any test that could trigger a real charge

## Known Behaviors

- <!-- e.g. Payment intent created on page load -->
- <!-- e.g. 3DS challenge shown for certain cards -->
- <!-- e.g. Retry limit of 3 attempts -->

## Edge Cases to Always Test

- Payment with insufficient funds
- Payment with expired card
- User navigates away mid-checkout
- Network timeout during payment submission
