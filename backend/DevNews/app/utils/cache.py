import asyncio
from typing import Any, Optional
import time
from datetime import datetime, timedelta
from app.config import config


class MemoryCache:
    def __init__(self):
        self._cache = {}
        self._timestamps = {}

    async def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            if time.time() - self._timestamps[key] < config.CACHE_DURATION_MINUTES * 60:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._timestamps[key]
        return None

    async def set(self, key: str, value: Any):
        self._cache[key] = value
        self._timestamps[key] = time.time()

    async def clear_expired(self):
        current_time = time.time()
        expired_keys = [
            key for key, timestamp in self._timestamps.items()
            if current_time - timestamp >= config.CACHE_DURATION_MINUTES * 60
        ]
        for key in expired_keys:
            del self._cache[key]
            del self._timestamps[key]


cache = MemoryCache()