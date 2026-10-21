import { createSlice } from "@reduxjs/toolkit";

const CART_KEY = "cart";

const loadCartFromStorage = () => {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveCartToStorage = (items) => {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
        // Ignore write error
    }
};

const initialState = {
    items: loadCartFromStorage(),
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { product, qty = 1 } = action.payload || {};
            if (!product || !product.id) return;

            const stock = Number(product.stock) || 0;
            if (stock <= 0) return;

            const existingIndex = state.items.findIndex((item) => item.productId === product.id);
            const addQty = Math.max(1, Math.min(qty, 1000));

            if (existingIndex >= 0) {
                const currentItem = state.items[existingIndex];
                const maxAllowed = Math.min(currentItem.stock, 1000);
                currentItem.quantity = Math.min(currentItem.quantity + addQty, maxAllowed);
            } else {
                const maxAllowed = Math.min(stock, 1000);
                state.items.push({
                    productId: product.id,
                    name: product.name,
                    sku: product.sku,
                    price: product.price,
                    stock: stock,
                    quantity: Math.min(addQty, maxAllowed),
                });
            }
            saveCartToStorage(state.items);
        },
        setQuantity: (state, action) => {
            const { productId, quantity } = action.payload || {};
            const item = state.items.find((i) => i.productId === productId);
            if (!item) return;

            const parsed = parseInt(quantity, 10);
            if (isNaN(parsed) || parsed < 1) {
                item.quantity = 1;
            } else {
                const maxAllowed = Math.min(item.stock, 1000);
                item.quantity = Math.min(parsed, maxAllowed);
            }
            saveCartToStorage(state.items);
        },
        removeFromCart: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter((item) => item.productId !== productId);
            saveCartToStorage(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            saveCartToStorage([]);
        },
    },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
export const selectCartSubtotal = (state) =>
    state.cart.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

export default cartSlice.reducer;
