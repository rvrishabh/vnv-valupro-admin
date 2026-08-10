import type { User } from "@/types";
import { atomWithStorage } from "jotai/utils";

// getOnInit: true forces a synchronous localStorage read on first render.
// Without it, jotai defers hydration to an effect (for SSR safety), so the
// `_authenticated` route guard's beforeLoad — which runs before effects
// flush — would see a stale `null` user on a fresh page load and bounce
// straight back to /login even for an already-authenticated session.
const userAtom = atomWithStorage<User | null>("user", null, undefined, {
  getOnInit: true,
});

export default userAtom;
