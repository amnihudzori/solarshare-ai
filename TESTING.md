# SolarShare AI — Verification and final check

## Automated verification performed in the review environment

- `npm test`: **10/10 tests pass**. Coverage includes SolarMatch input and shade factors, homeowner interest/review/withdrawal, RoofRipple capacity and consent-aware alternatives, snapshot immutability, support requests, sample scenario arithmetic and local-browser saved-state migration.
- TypeScript 5.8 parser check: **no JSX parsing errors** using `tsc --allowJs --checkJs false --noEmit --jsx preserve --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck --noResolve src/*.jsx`.
- Existing Vite configuration, source routes and GitHub Actions workflow were inspected.



## Required local final checks

Run from the project folder:

```powershell
npm ci
npm test
npm run build
npm run dev
```

Check the following at 1366×768, 1440×900 and a mobile-sized viewport. Scrolling is acceptable; **overlapping or clipped text/buttons are not**.

- Welcome: choose each role; no fake password/login screen; Switch Role returns to Welcome.
- Management Overview: the four statistics are correctly labelled; clicking a house changes the selected property panel; no obsolete facility tools in the sidebar.
- Planner: house labels are readable; map responds to click and keyboard selection; House B13 shows roof details without 'Synthetic seed record'.
- RoofRipple: create new plan, choose house to remove, try interested alternative, remove alternative again, edit 24 kWp planning goal, check before/after/difference; saved older plans are view-only.
- Resident A12: input 30 m² + Low shade → 5.1 kWp and 17.9 kWh/day; register interest once; cannot duplicate an active application; My Application shows its history.
- Management Review: review A12, save a new stage plus text; Switch Role → Resident A12 displays the update. Support requests remain in Solar Rescue rather than duplicated under Review.
- Withdrawal: Resident A12 withdraws and confirms; management statistics and map update; creating a *new* RoofRipple plan excludes A12; previous saved plan remains unchanged; A12 can register new interest.
- Solar Rescue: Resident B15 submits issue; second open case blocked for same installed house; management replies or closes; Resident B15 sees progress; House A12 cannot report before installation.
- Settings: Data & Sources distinguishes synthetic records and public background references; Reset Data restores sample data and clears previous application/case/RoofRipple changes.
- Persistence: reload browser to check that progress remains. Different computers and browser profiles do **not** synchronize.


