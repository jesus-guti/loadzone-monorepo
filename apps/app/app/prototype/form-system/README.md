# Form System pilots (JES-70)

Throwaway prototype for the Form System contract (classic submit + settings autosave).

## Run

```bash
pnpm --filter app dev
```

Open [http://localhost:3000/prototype/form-system](http://localhost:3000/prototype/form-system) (signed-in staff if the app layout requires auth).

## What to try

### Pilot A — classic submit

- Valid names → stub success toast + form reset.
- Club name `fail` → `fieldErrors` mapped into RHF.
- Team name `root` → `formError` on root.
- Club name `toast` → `toastError` only.

### Pilot B — wellness autosave

- Change Select templates → immediate save.
- Type numbers → debounce 300ms; blur flushes.
- Empty limit fields are valid (disabled).
- Out-of-range blocks save (inline FormMessage).
- Value `99` → server fail: toast; discrete fields revert; text keeps dirty.
- State panel shows dirty / last-saved / recent saves.

## Non-goals

- Production migration of CreateTeamForm / WellnessSettingsForm.
- Full monorepo build.
