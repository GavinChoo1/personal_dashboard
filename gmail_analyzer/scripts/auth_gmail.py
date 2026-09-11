import os
import sys
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

# Scopes required for Gmail read-only access
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

BASE_DIR = Path(__file__).resolve().parent.parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

def authenticate():
    """
    Runs local web server OAuth 2.0 flow to generate token.json.
    """
    if not CREDENTIALS_FILE.exists():
        print(f"Error: OAuth client secrets file not found at: {CREDENTIALS_FILE}")
        print("\nHow to set up:")
        print("1. Visit Google Cloud Console -> APIs & Services -> Credentials")
        print("2. Create an OAuth 2.0 Client ID of type 'Desktop app'")
        print("3. Download JSON and rename it to 'backend/credentials.json'")
        sys.exit(1)

    print(f"Starting OAuth flow using: {CREDENTIALS_FILE}")
    flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
    creds = flow.run_local_server(port=0)

    with open(TOKEN_FILE, "w", encoding="utf-8") as token:
        token.write(creds.to_json())

    print(f"\nAuthentication successful! Saved token to: {TOKEN_FILE}")

if __name__ == "__main__":
    authenticate()
