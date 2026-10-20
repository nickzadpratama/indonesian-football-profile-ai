import { useSyncExternalStore } from "react";
import { getToken, subscribeToAuthChanges } from "./session.js";

export default function useSessionToken() {
  return useSyncExternalStore(subscribeToAuthChanges, getToken, () => "");
}
