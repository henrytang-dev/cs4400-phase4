# Phase IV Emergency room

## Backend setup
- Install: `pip install -r requirements.txt`
- Run: `python app.py` (serves on http://localhost:5001)
- Edit `db.py` with your MySQL creds (host, user, password, database)
- Make sure ERMS schema, views, and stored procedures already loaded in mysql

## Frontend setup
- `cd` into `frontend` folder and run `npm install`
- Start dev server: `npm run dev` (will run @ http://localhost:3000)
- Update API base in `src/api.js` if you use a diff backend host or port
