import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const url = "https://tycbfvhcwajpctmlvkfk.supabase.co";
const anonKey = "sb_publishable_TFVItN8TEpb4MZMTJgut0Q_awdJb6va";
const storage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = createClient(
  url,
  anonKey,
  { auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);
