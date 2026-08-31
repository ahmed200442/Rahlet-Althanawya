import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const url = "https://tycbfvhcwajpctmlvkfk.supabase.co";
const anonKey = "sb_publishable_TFVItN8TEpb4MZMTJgut0Q_awdJb6va";

// Keep the first release independent from native secure-storage initialization.
// The previous build could close immediately on some Android devices while
// Supabase was initializing its persistent SecureStore adapter.
const memoryStorage = {
  data: Object.create(null),
  async getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
  },
  async setItem(key, value) {
    this.data[key] = value;
  },
  async removeItem(key) {
    delete this.data[key];
  },
};

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: memoryStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
