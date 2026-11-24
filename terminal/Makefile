.PHONY: dev backend frontend test clean

dev:
	@echo "Starting Tessera (Backend :8000 + Frontend :5173)..."
	@bash -c 'trap "kill 0" EXIT; \
		(cd backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) & \
		(cd frontend && npm run dev -- --host 0.0.0.0 --port 5173) & \
		wait'

backend:
	cd backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev -- --host 0.0.0.0 --port 5173

test:
	cd backend && ./venv/bin/pytest -v app/tests

clean:
	rm -rf backend/__pycache__ backend/app/__pycache__ backend/app/*/__pycache__
	rm -rf backend/.pytest_cache frontend/dist
