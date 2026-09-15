# Location & Delivery Serviceability Architecture 📍

This document describes device geolocation, reverse geocoding, pincode serviceability verification, and saved address management in **CareSure Customer**.

---

## 1. Location Lifecycle Walkthrough

```text
User opens app or taps Location Header
                    │
                    ▼
Request GPS Permission (expo-location)
    │
    ├── Granted:
    │     1. Obtain current GPS latitude & longitude (Location.getCurrentPositionAsync)
    │     2. Reverse geocode coordinates to street, city, state, pincode (location.service.ts)
    │     3. Verify serviceability with backend (pincode.api.ts)
    │
    └── Denied / Unavailable:
          1. Fallback to manual address selection bottom sheet
          2. User enters 6-digit pincode manually
                    │
                    ▼
Update Location Store (useLocationStore)
    - Persists active location & pincode to AsyncStorage
    - Header shows formatted delivery address (e.g. "Deliver to Home - 560001")
                    │
                    ▼
Catalog Filtering & Checkout Gating
    - Unserviceable pincodes display warning badges
    - Checkout prevents order submission if pincode is non-serviceable
```

---

## 2. Reverse Geocoding Implementation (`location.service.ts`)

When GPS coordinates are received:
1. Calls `Location.reverseGeocodeAsync({ latitude, longitude })`.
2. Extracts postal code, subregion, city, and street name.
3. Formats the primary and secondary display strings.
4. Checks if the detected pincode exists within the active pharmacy network.

---

## 3. Pincode Serviceability Engine (`pincode.api.ts`)

The app verifies delivery feasibility via `POST /api/v1/pincodes/check`:
- **Response**: `{ serviceable: boolean, estimatedDeliveryHours: number, standardDeliveryCharge: number }`.
- **Error Resilience**: The API handles non-2xx status codes cleanly. If the backend returns a 404 or 400 with a `{ serviceable: false }` body, the client marks the area unserviceable rather than crashing with an unhandled network exception.

---

## 4. Address Book Management (`/profile/addresses`)

Authenticated users can manage multiple saved delivery addresses:
- Address types: `HOME`, `WORK`, `OTHER`.
- Custom recipient name, phone number, house number, landmark, and GPS pin.
- Default address flag: Automatically pre-selects the default address during checkout.
- Address state is cached via React Query (`queryKeys.addresses()`).
