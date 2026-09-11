# Forwarding entrypoint to backend.dashboard.main
from backend.dashboard.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.dashboard.main:app", host="127.0.0.1", port=8000, reload=True)
