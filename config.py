import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration
DATABASE_PATH = os.path.join(BASE_DIR, 'data', 'contacts.db')
DATABASE_URI = f'sqlite:///{DATABASE_PATH}'

# Email configuration (can be set via environment variables)
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = os.getenv('EMAIL_PORT', 587)
EMAIL_USER = os.getenv('EMAIL_USER', '')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')

# Application settings
DEBUG = True
HOST = '0.0.0.0'
PORT = 5001

# Job categories
JOB_CATEGORIES = [
    'Tech',
    'Healthcare',
    'Real Estate',
    'Construction',
    'Finance',
    'Marketing',
    'Education',
    'Retail',
    'Manufacturing',
    'Other'
]

# Contact statuses
CONTACT_STATUSES = [
    'Lead',
    'Contacted',
    'Replied',
    'Qualified',
    'Not Interested',
    'Converted'
]
