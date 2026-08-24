# Frontend conventions

## Route structure

Each route (e.g. `src/routes/_authenticated/cases/`) keeps only its `index.tsx` / `$id.tsx` / `new.tsx` route
files at the top level. Anything the route needs that isn't reusable elsewhere goes into a `-components`
folder next to it (the leading `-` is a TanStack Router convention that excludes the folder from the route
tree):

```
src/routes/_authenticated/cases/
  index.tsx              <- route: composes -components, stays thin
  $id.tsx
  new.tsx
  -components/
    CasesTable.tsx        <- columns + table for the list route
    CaseFormModal.tsx      <- create/edit modal
    CaseDetailHeader.tsx
    ...
```

Rules:
- Split each route's `index.tsx` (or other route file) into small, single-purpose components under that
  route's own `-components` folder. Don't leave one large file with everything inline.
- Components that live in a route's `-components` folder are for that route only. Do **not** move them into
  the shared `src/components/` folder — that folder is reserved for components genuinely reused across
  multiple routes/features.
- If a piece of UI turns out to be needed by more than one route, promote it to `src/components/` at that
  point — don't default to putting things there just in case.

## No inline domain types or schemas in route files

- Never declare a Zod schema (`z.object(...)`) inside a route file or a `-components` file, including
  local form-only schemas. Put it in `src/schemas/<feature>.schema.ts` and export it from
  `src/schemas/index.ts`, then `import { xSchema } from "@/schemas"`. This applies even to schemas that
  only back a form and aren't sent as-is to an API — give them their own named export (e.g.
  `roleFormSchema`) next to the API payload schemas for that feature.
- Never declare a domain/business `interface`/`type` (anything shaping API data — e.g. `Role`,
  `CreateRolePayload`, a `z.infer` of a schema) inside a route file or a `-components` file. Put it in
  `src/types/<feature>.types.ts` and export it from `src/types/index.ts`, then
  `import type { X } from "@/types"`.
- The one exception: a component's own `Props` interface/type (e.g. `interface RoleFormModalProps`) stays
  colocated with that component — it's an implementation detail of that component's signature, not a
  domain type, and nothing outside the component ever imports it.

## Prefer reusable components — don't write raw form/UI markup

Before writing raw `<input>`/`<select>`/`<textarea>` or hand-rolled modal/date-picker markup, check
`src/components/` first (`Form/*`, `Modal`, `DataTable/*`, `Dropdowns/*`, `AlertPopup`, `Uploader`, `ui/*`,
etc.) and use what's there:
1. If a matching reusable component exists in `src/components/`, use it.
2. If it doesn't exist but the piece is generic enough to be reused across routes, create it in
   `src/components/` and use it.
3. Only write something directly inline in the route/-components file if it's a one-off that isn't worth
   generalizing.

## Other standing rules

- The "admin" role's permissions must never be editable in the app.
