import multiprocessing

# Server socket
bind = "0.0.0.0:10000"

# Worker processes
workers = 1
threads = 1
worker_class = "sync"

# Timeout
timeout = 300
graceful_timeout = 300

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "debug"

# Limit worker memory usage
max_requests = 1000
max_requests_jitter = 100

# Preload application for better performance
preload_app = True