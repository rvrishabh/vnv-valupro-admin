import { atomWithStorage } from "jotai/utils";

export interface User {
  id: string | null;
  email: string | null;
  name?: string | null;
}

const userAtom = atomWithStorage<User>("user", {
  id: null,
  email: null,
  name: null,
});

export default userAtom;
