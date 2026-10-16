import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token") || null;

const initialState = {
    token: token,
    user: null,                   // { id, name, email, role, status }
    isAuthenticated: Boolean(token),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
            state.error = null;
            if (token) {
                localStorage.setItem("token", token);
            }
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("token");
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setCredentials, setUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
