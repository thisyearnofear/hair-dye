import multiprocessing

# Server socket
bind = "127.0.0.1:8001"

# Worker processes
workers = 1  # Single worker for ML tasks
threads = 1  # Reduce thread count
worker_class = "sync"  # Change from 'gthread' to 'sync'

# Timeout
timeout = 300  # Increase timeout to 5 minutes
graceful_timeout = 300  # Matching graceful timeout

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "debug"  # Increase logging detail for debugging

# Limit worker memory usage
max_requests = 1000  # Changed from 1
max_requests_jitter = 100  # Added jitter

# Preload application for better performance
preload_app = True 