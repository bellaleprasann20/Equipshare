# EquipShare — Intelligent Construction Equipment Allocation and Utilization System

An MCA final-year capstone project (PES University, Bengaluru) that ranks construction
equipment for a project request using a machine-learning-derived Equipment Efficiency
Index (EEI) and a multi-factor allocation score, instead of manual filtering.

## What this project does

- **Equipment Efficiency Index (EEI):** a 0–100 score per machine, combining
  utilization, reliability, maintenance recency, age and operating cost. The weights
  are learned by training a Linear Regression model (see `research/algorithms/`),
  not hand-picked.
- **Multi-factor allocation ranking:** given a project's requirement (equipment type,
  site, dates), the backend scores every available matching machine on EEI,
  proximity, transfer cost and duration fit, and returns a ranked, explainable
  shortlist.
- **Rent and Buy storefront:** browse the fleet, add machines to a cart as a rental
  or a purchase, and check out. Checkout is simulated — no real payment is taken.
- **Locations:** a map and directory of every site where equipment is based.
- **Analytics and admin dashboards:** fleet utilization, overdue maintenance, and a
  comparison of the proposed ranking method against baseline strategies.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS v4, React Router, Recharts, React Leaflet
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Research / ML:** Python, scikit-learn, pandas (EEI model training)

## Project structure
equipshare/
├── frontend/ React app (Vite)
├── backend/ Node/Express API + MongoDB models
├── research/ EEI model training script, dataset, methodology notes
└── docs/ Proposal, architecture diagrams (add as you write them)

## Prerequisites

- Node.js 18 or later
- npm
- A MongoDB Atlas account (free tier is enough) — see [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Python 3.9+ (only needed if you want to re-run the EEI model training)

## Setup

### 1. Clone the repo

```powershell
git clone https://github.com/<your-username>/equipshare.git
cd equipshare
```

### 2. Backend

```powershell
cd backend
npm install
copy .env.example .env
```

Open `.env` and fill in:
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=any-long-random-string

Generate a `JWT_SECRET` with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Seed the database (creates 24 catalog machines with prices, plus two test accounts):

```powershell
npm run seed
```

To also load the 150 extra machines used for the EEI/allocation experiments:

```powershell
npm run seed:full
```

Start the backend:

```powershell
npm run dev
```

It should print `EquipShare backend running on http://localhost:5000`.

### 3. Frontend

Open a **second** terminal:

```powershell
cd frontend
npm install leaflet@1.9.4 react-leaflet@4.2.1
npm install
copy .env.example .env
npm run dev
```

Open the URL it prints, usually `http://localhost:5173`.

### 4. Equipment photos (optional)

Photos go in `frontend/public/images/equipment/`, named by equipment code — for example
`ex-01.jpg` for the first excavator. See the file list in `backend/data/catalogEquipment.js`
for every expected file name. A missing photo just shows the machine's code instead of a
broken image, so this step can be skipped.

## Test accounts

Created by `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Fleet admin | `admin@equipshare.test` | `password123` |
| Project manager | `manager@equipshare.test` | `password123` |

## Common issues

- **Blank page, no errors:** `frontend/index.html` is missing or misplaced. It must sit
  directly inside `frontend/`, next to `package.json`, not inside `src/`.
- **"Failed to resolve import ... react-leaflet":** run
  `npm install leaflet@1.9.4 react-leaflet@4.2.1` inside `frontend/`.
- **Login/Register does nothing:** the backend isn't running, or `frontend/.env`
  doesn't point at it. Confirm the backend terminal shows "running on
  http://localhost:5000" and `frontend/.env` has
  `VITE_API_BASE_URL=http://localhost:5000/api`.
- **Rent/Buy pages are empty:** the database hasn't been seeded. Run `npm run seed`
  in `backend/`.
- **Text in a form is invisible:** usually means a component still has a leftover
  light-theme background color. Check `src/index.css` was saved and the dev server
  was restarted after any styling change.
- **A different person's login fails with 401:** each person running this locally
  needs their own `backend/.env` pointing at a MongoDB database that has been seeded.
  Test accounts only exist in whichever database `npm run seed` was run against.

## Re-training the EEI model

The weights in `backend/src/services/eeiCalculator.js` come from a trained Linear
Regression model, not a hand-picked formula. To retrain after changing the dataset:

```powershell
cd research/algorithms
pip install scikit-learn pandas numpy
python train_eei_model.py
```

Copy the new `weights` object from the generated `learned_weights.json` into
`DEFAULT_WEIGHTS` in `backend/src/services/eeiCalculator.js`.

## Project background

Developed for the MCA capstone at PES University. See `docs/proposal/` for the
Phase-1 proposal and guide feedback, and `research/` for the methodology,
dataset documentation and evaluation against baseline allocation strategies
(first-available, nearest-equipment, availability-only, highest-EEI-only).

## License

Academic project — not licensed for commercial use.