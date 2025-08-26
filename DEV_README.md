Local development quick start
===========================

1) Activate the Python venv and install backend deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2) Run the backend (task or manual):

Using VS Code Task: run `Run Backend` task (uses `.venv/bin/python3 backend/main.py`).

Or manually:
```bash
.venv/bin/python3 backend/main.py
```

3) Run the mobile frontend (Expo):

```bash
npm start --prefix mobile
```

4) Mobile app local backend config

- By default the mobile app uses `http://localhost:8000` on web/iOS simulator and `http://10.0.2.2:8000` on Android emulator when running in development.
- You can override the URL in development by setting the `API_BASE_URL` environment variable when starting Expo, for example:

```bash
API_BASE_URL=http://192.168.1.244:8000 npm start --prefix mobile
```

This is useful when testing on a physical device on the same LAN.
