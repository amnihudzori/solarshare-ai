# SolarShare AI — Every Kilowatt Counts

A **working frontend prototype** for community rooftop solar participation in Malaysia. It connects a homeowner journey (rooftop estimate, register interest, application updates, solar support) to township management (dashboard, interactive neighbourhood map, planning with RoofRipple, application reviews and support follow-ups).

Seri Hijau Township, all home records, applications and existing installations are **synthetic data**. The interface uses simple language and marks synthetic data in the footer and in **Data & Sources**. The prototype is not connected to real solar meters, public weather APIs, or a shared server.

## Run on Windows

Requirements: Node.js 22.12+ and npm. Open this folder in VS Code; in a terminal:

```powershell
npm ci
npm test
npm run dev
```

Open the URL shown by Vite (usually `http://127.0.0.1:5173/solarshare-ai/`). The development server does not need a password or API key. For a production build:

```powershell
npm run build
npm run preview
```

Build output is in `dist/`. Do not put `node_modules`, `dist`, or `.git` inside the source submission ZIP. The included GitHub Actions workflow builds and deploys the site to GitHub Pages once configured.

## Main interfaces

| Interface | What it does |
| --- | --- |
| Welcome | Choose the Township Management or Homeowner / Resident workspace. These are local preview roles, not secure account login. |
| Township Overview | Track interested homeowners, estimated potential capacity, existing installations and open support requests. |
| Township Solar Planner | Select a house on the illustrated neighbourhood map to see its roof details and application status. |
| RoofRipple (in Planner) | Model a household leaving a candidate solar plan, try an already-interested alternative, change the planning goal, and compare capacity before/after. This does **not** change an application. |
| My Solar Opportunity | Estimate rooftop solar potential with SolarMatch; register interest and read application updates; voluntarily withdraw interest if not bound to an installation. |
| Solar Rescue | Resident with an installed system reports an issue; management records a status and a reply, visible when switching back to resident in the same browser. |
| Management Review | Review applications, update homeowner next steps and inspect a township summary. Support requests are handled separately under Solar Rescue. |
| Community Information | Introduces the programme and shows sample township progress. |

The old facility monitoring, Green Hours and fake sign-in pages are removed from the navigation. Historic URL bookmarks redirect safely to the Township Overview.

## Quick product walkthrough

1. On Welcome select **Homeowner / Resident**, choose House **A12**, and open SolarMatch. With 30 m² and Low shade the estimate is **5.1 kWp** and **17.85 kWh/day** (display rounds to 17.9).
2. Tick the interest consent box and select **Register My Interest**. The application appears in **My Application**.
3. Select **Switch Role**, enter **Township Management**, open **Management Review**, select A12 and save a status/update. Switch back to Resident to see that message in **My Application**.
4. Go to **Township Solar Planner → RoofRipple → Create New Plan**. With A12 participating, baseline capacity is **22.95 kWp**. Remove A12 to see **17.85 kWp**; try B12 to reach **24.99 kWp**. You may edit the planning goal; it is **not** a government eligibility threshold.
5. Back as Resident, withdraw A12's interest in **My Application**. The live application and map update. Existing RoofRipple plans remain historical; create a new one to see the latest participation.
6. As Resident, choose House **B15** and report an issue under **Solar Rescue**. Switch to Management → **Solar Rescue**, save a reply and status, then switch back to B15 to read the update.
7. Select **Profile & Settings → Reset Data** to restore the original synthetic township data.

Changes persist in this **one browser**, not between devices. Use only fictional test information. Select **Data & Sources** for assumptions and public references.

## Data and calculations

All properties and application/case records are synthetic. Initial sample records include 8 interested homes, 36.89 kWp of estimated eligible candidate capacity and a separate 6.12 kWp installed household. These values reflect different categories and must not be added together as if they were all installed capacity.

**SolarMatch** uses transparent assumptions:

- `capacity (kWp) = usable roof area (m²) × 0.17`
- `estimated daily energy (kWh) = capacity × 3.5 × shade factor`
- Shade factors: Low = 1, Medium = 0.85, High = 0.6.

**RoofRipple** uses only already-interested, available, complete, unbound preliminary applications as candidate alternatives. Changes to a RoofRipple plan never enroll households, change their consent, or modify installation records. The default 24 kWp goal is a user-adjustable planning assumption, **not** official Malaysian programme approval.

**Data provenance:** [Energy Commission CREAM](https://www.st.gov.my/sustainability/energy-transition-programmes/community-renewable-energy-aggregation-mechanism-cream), [Sime Darby Property City of Elmina rooftop solar initiative](https://www.simedarbyproperty.com/press-releases/sime-darby-property-launches-nations-first-residential-solar-project-under-netr), [NASA POWER documentation](https://power.larc.nasa.gov/docs/services/api/temporal/hourly/) and [PVWatts](https://pvwatts.nlr.gov/pvwatts.php) provide public context. **NASA POWER and PVWatts are references only, not live or ingested sources of the app's coefficients.** Site-specific structural, electrical, ownership, consent and programme checks would be needed in a real rollout. In rooftop-leasing arrangements, homeowner electricity bill savings cannot automatically be assumed.

The township map is an **original stylised architectural SVG**, not photographed or surveyed geography. The current application uses a rule-based calculator rather than a trained model or live AI service. AI-assisted coding tools were used to help refine the prototype; see the team's submission requirements for appropriate disclosure.

## Source structure

```text
src/components.jsx            Layout, reusable widgets and Data & Sources
src/screens.jsx               Welcome and Community Information
src/participationScreens.jsx  Management dashboard, Planner, Resident, Rescue, Review
src/TownshipMap.jsx           Original interactive neighbourhood artwork
src/participation.js          Sample data and all rooftop/application/support rules
src/storage.js                Safe local-browser state restoration
src/store.jsx                 Browser state and role switching
src/styles.css                Original premium colour system and layout
src/participation.css         Community rooftop planning and resident layouts
src/*.test.js                 Unit tests for rules and storage
.github/workflows/deploy.yml  GitHub Pages build/deploy workflow
```



If you use another repository name, update `base` in `vite.config.js`. **This project was not pushed or deployed by this audit.**

See `TESTING.md` for test evidence and remaining verification.
