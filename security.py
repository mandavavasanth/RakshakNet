from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY', 'rashaknet-secret-key-2026')
api_key_header = APIKeyHeader(name='X-API-Key', auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail='Invalid or missing API Key')
    return api_key
