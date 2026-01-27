import uvicorn
import os
from app.config import config

if __name__ == "__main__":
    # Production configuration
    workers = min(os.cpu_count(), 2) if config.USE_GPU else os.cpu_count()  # Reduced for GPU memory
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        workers=workers,
        reload=True,
        log_level="info",
        access_log=True
    )
    
