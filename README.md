# MyWallet – Personal Expense & Budget Tracker

React (Vite) + Django REST Framework + SQLite + Recharts + Lucide icons.

---------------------------------------------------------------------
## 1. Install these once
1. Python 3.10+  (python.org – tick "Add Python to PATH")
2. Node.js LTS   (nodejs.org)
3. VS Code       (optional but recommended)

Check in PowerShell:
    python --version
    node --version
    npm --version

## 2. Run the BACKEND (PowerShell window 1)
    cd path\to\MyWallet\backend
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py seed_demo        # optional demo account
    python manage.py runserver

(If Activate.ps1 is blocked, run once:  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned)

Backend runs at http://127.0.0.1:8000

## 3. Run the FRONTEND (PowerShell window 2)
    cd path\to\MyWallet\frontend
    npm install
    npm run dev

Open http://localhost:5173 in the browser.

Keep BOTH windows running while using the app.

## 4. Logging in
* Click "Create an account" to register your own account, OR
* Use the optional demo account (only if you ran seed_demo):
      demo@mywallet.com  /  Demo@1234
  Demo data lives in its own separate account, never mixed with real users.
  Rebuild it any time:  python manage.py seed_demo --reset

## 5. Admin panel (optional)
    python manage.py createsuperuser
Then open http://127.0.0.1:8000/admin/

## 6. Run the automated backend tests
    python manage.py test

---------------------------------------------------------------------
## Folder structure
MyWallet/
  backend/
    manage.py, requirements.txt, db.sqlite3 (created by migrate)
    config/    settings.py, urls.py
    accounts/  serializers.py, views.py, urls.py        (register/login/logout/profile)
    tracker/   models.py, serializers.py, views.py, urls.py, utils.py, tests.py
               management/commands/seed_demo.py
  frontend/
    index.html, package.json, vite.config.js
    src/
      api/axios.js            API client + token handling
      context/                Auth, Toast, AppData (modal + categories)
      components/             Sidebar, Topbar, Layout, StatCard, TransactionTable,
                              TransactionModal, ConfirmDialog, EmptyState, Loader,
                              ProgressBar, ProtectedRoute, charts/
      pages/                  Login, Register, Dashboard, Transactions, Budget,
                              Analytics, Profile
      styles/                 global.css, layout.css, components.css, pages.css
      utils/format.js         currency/date helpers (currency set to INR here)

## API endpoints
POST /api/auth/register/        POST /api/auth/login/       POST /api/auth/logout/
GET|PATCH /api/auth/profile/    POST /api/auth/change-password/
GET|POST /api/transactions/     (?search= &type= &category= &start= &end=)
GET|PUT|PATCH|DELETE /api/transactions/<id>/
GET|POST /api/budgets/          (?month= &year=)
GET /api/dashboard/             GET /api/analytics/?months=6|12
GET /api/categories/

## How it works (for your viva)
* Login returns a Token. React stores it in localStorage and axios sends
  "Authorization: Token <key>" with every request.
* Every Django query filters by request.user, so users only see their own data.
* Passwords are hashed by Django (create_user / set_password).
* Dashboard and Analytics numbers are calculated by Django from the database
  (Sum / filter in tracker/views.py and tracker/utils.py).
* Budget status: under 80% = ok, 80-100% = warning, over 100% = exceeded.
* After any save/delete, a `version` counter in AppDataContext increases and
  every page reloads its data from the API.
* To change currency, edit CURRENCY and LOCALE in frontend/src/utils/format.js.

## Common errors
* "Cannot reach the server" toast  -> Django is not running (window 1).
* 'python' not recognized          -> reinstall Python with "Add to PATH".
* npm not recognized               -> reinstall Node.js, reopen PowerShell.
* Port 8000 in use                 -> python manage.py runserver 8001, and create
                                       frontend\.env with  VITE_API_URL=http://127.0.0.1:8001/api
* CORS error in browser console    -> open the site on http://localhost:5173 (or
                                       127.0.0.1:5173) and keep the Django server running.
* "no such table"                  -> run  python manage.py migrate
* Forgot to activate venv          -> run .\venv\Scripts\Activate.ps1 again
