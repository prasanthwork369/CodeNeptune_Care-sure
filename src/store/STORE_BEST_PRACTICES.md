# Zustand Store Best Practices

## Quick Rules

### ✅ DO: Use Selectors
```typescript
// Only re-renders if items change
const items = useCartPendingStore(selectCartItems);

// Only re-renders if item count changes
const count = useCartPendingStore(selectCartItemCount);

// Only re-renders if total price changes
const total = useCartPendingStore(selectCartTotalPrice);
```

### ❌ DON'T: Use Full Store
```typescript
// Re-renders on ANY store change (bad!)
const store = useCartPendingStore();
```

---

## Performance Impact

| Pattern | Re-renders on Change | Benefit |
|---------|---------------------|---------|
| Full store | ANY field | ❌ Worst |
| Multiple selectors | Only watched fields | ✅ Best |
| Single selector | Only that field | ✅ Best |

**Real Example**:
- Cart has 100 items
- Add item to pending IDs → triggers state update
- ❌ Full store: Components re-render even if they only use `count`
- ✅ Selectors: Only components using `pendingIds` re-render

---

## Common Patterns

### Pattern 1: Display Cart Badge
```typescript
// pages/cart-icon.tsx
import { selectCartItemCount } from '@/src/store/selectors';

export function CartIcon() {
  const count = useCartPendingStore(selectCartItemCount);
  
  return (
    <Badge count={count} />
  );
}
```

### Pattern 2: Show User Name
```typescript
// pages/profile-header.tsx
import { selectUser } from '@/src/store/selectors';

export function ProfileHeader() {
  const user = useAuthStore(selectUser);
  
  return <Text>Hello, {user?.name}</Text>;
}
```

### Pattern 3: Cart Items List
```typescript
// features/cart/CartItemsList.tsx
import { selectCartItems, selectPendingIds } from '@/src/store/selectors';

export function CartItemsList() {
  const items = useCartPendingStore(selectCartItems);
  const pendingIds = useCartPendingStore(selectPendingIds);
  
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <CartItem 
          item={item}
          isPending={pendingIds[item.id]}
        />
      )}
    />
  );
}
```

### Pattern 4: Form Input (Address)
```typescript
// features/checkout/AddressInput.tsx
import { selectCheckoutAddress } from '@/src/store/selectors';

export function AddressInput() {
  const address = useCheckoutStore(selectCheckoutAddress);
  
  return (
    <TextInput
      value={address?.street ?? ''}
      placeholder="Enter address"
    />
  );
}
```

---

## When to Add New Selectors

Add a new selector when:

1. **A component needs part of the store** (not the whole thing)
2. **Multiple components need the same data** (reuse the selector)
3. **The data requires computation** (e.g., `selectCartTotalPrice`)

```typescript
// ✓ Good: Useful for many components
export const selectCartTotalPrice = (state) => {
  return state.guestCart.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity),
    0
  );
};

// ❌ Skip: Rarely used, used only once
export const selectRandomItemId = (state) => state.guestCart.items[0]?.id;
```

---

## Creating a New Store with Selectors

```typescript
// store/myStore.ts
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: [],
  loading: false,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
}));

// store/selectors.ts
export const selectMyData = (state) => state.data;
export const selectIsLoading = (state) => state.loading;

// Usage
const data = useMyStore(selectMyData);
const loading = useMyStore(selectIsLoading);
```

---

## Common Mistakes

### ❌ Mistake 1: Defining Selectors Inside Components
```typescript
function CartBadge() {
  // ❌ New selector function created on every render!
  const count = useCartPendingStore(state => state.guestCart.items.length);
  return <Text>{count}</Text>;
}
```

```typescript
// ✓ Define at module level
export const selectCartItemCount = (state) => 
  state.guestCart.items.length;

function CartBadge() {
  const count = useCartPendingStore(selectCartItemCount);
  return <Text>{count}</Text>;
}
```

### ❌ Mistake 2: Selector That Returns New Object Every Time
```typescript
// ❌ Always returns new object, always triggers re-render
export const selectCartInfo = (state) => ({
  count: state.guestCart.items.length,
  total: state.guestCart.items.reduce(...),
});
```

```typescript
// ✓ Use separate selectors
export const selectCartItemCount = (state) => state.guestCart.items.length;
export const selectCartTotalPrice = (state) => state.guestCart.items.reduce(...);
```

### ❌ Mistake 3: Complex Computations in Selectors
```typescript
// ❌ Expensive computation runs on every state update
export const selectExpensiveData = (state) => {
  return state.items.filter(...).map(...).sort(...);
};
```

```typescript
// ✓ Cache computed data in the store instead
export const useMyStore = create((set) => ({
  items: [],
  cached: [],
  setItems: (items) => set({
    items,
    cached: items.filter(...).map(...).sort(...),
  }),
}));

export const selectCached = (state) => state.cached;
```

---

## Testing with Selectors

```typescript
import { selectCartItemCount } from '@/src/store/selectors';
import { useCartPendingStore } from '@/src/store/cartStore';

test('cart item count', () => {
  const state = useCartPendingStore.getState();
  const count = selectCartItemCount(state);
  expect(count).toBe(0);
});
```

---

## Migration Checklist

- [ ] Create selectors.ts file ✅ Done
- [ ] Review components using stores
- [ ] Replace `const store = useStore()` with selectors
- [ ] Verify component re-renders decreased (React DevTools Profiler)
- [ ] Test offline functionality
- [ ] Test Zustand persist still works

---

## Files to Update

Priority order (most re-renders):

1. Cart-related components (high traffic)
2. Auth-related components (login/profile)
3. Checkout components (critical path)
4. UI state components (modals, loading)
5. Everything else
