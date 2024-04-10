// 来自互联网
import { ref, Ref, markRaw } from "vue";
export type MapValue<K, T> = Iterable<readonly [K, T]>;
export type Actions<K, T> = {
  set: (key: K, value: T) => void;
  get: (key: K) => T | undefined;
  remove: (key: K) => void;
  has: (key: K) => boolean;
  clear: () => void;
  setAll: (newMap: MapValue<K, T>) => void;
  reset: () => void;
};

export function useMap<K, T>(
  initialValue?: MapValue<K, T>
): { state: Ref<Map<K, T>>; actions: Actions<K, T> } {
  const initialMap = initialValue ? new Map(initialValue) : new Map();
  const state = ref(initialMap) as Ref<Map<K, T>>;
  const actions: Actions<K, T> = {
    set: (key, value) => {
      state.value.set(key, value);
    },
    get: (key) => {
      return state.value.get(key);
    },
    remove: (key) => {
      state.value.delete(key);
    },
    has: (key) => state.value.has(key),
    clear: () => state.value.clear(),
    setAll: (newMap) => {
      state.value = new Map(newMap);
    },
    reset: () => (state.value = initialMap),
  };
  return {
    state,
    actions: markRaw(actions),
  };
}
