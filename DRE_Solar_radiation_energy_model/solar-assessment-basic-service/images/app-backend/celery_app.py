from celery import Celery
import os

redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')

celery = Celery(
    'solar_tasks',
    broker=redis_url,
    backend=redis_url,
)

# Ensure Celery loads tasks.py
celery.conf.include = ['tasks']

celery.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)