import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const storage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder",
  { auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);
