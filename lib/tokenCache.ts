import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const tokenCache = {
    async getToken(key: string) {
        if (Platform.OS === "web") {
            return localStorage.getItem(key);
        }

        try {
            return await SecureStore.getItemAsync(key);
        } catch (err) {
            console.error("SecureStore getToken error:", err);
            return null;
        }
    },

    async saveToken(key: string, value: string) {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
            return;
        }

        try {
            await SecureStore.setItemAsync(key, value);
        } catch (err) {
            console.error("SecureStore saveToken error:", err);
        }
    },

    async clearToken(key: string) {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
            return;
        }

        try {
            await SecureStore.deleteItemAsync(key);
        } catch (err) {
            console.error("SecureStore clearToken error:", err);
        }
    },
};