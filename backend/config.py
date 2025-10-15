import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = os.path.join(BASE_DIR, 'data', 'contacts.db')
DATABASE_URI = f'sqlite:///{DATABASE_PATH}'

# Email configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = os.getenv('EMAIL_PORT', 587)
EMAIL_USER = os.getenv('EMAIL_USER', '')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')

# API Keys - TEMPORARILY HARDCODED FOR TESTING
GOOGLE_PLACES_API_KEY = 'AIzaSyD09_PunBvn1rOh_INFn5LJ_R7Q-gGu3J4'
YELP_API_KEY = os.getenv('YELP_API_KEY', '')

DEBUG = True
HOST = '0.0.0.0'
PORT = 5001

JOB_CATEGORIES = [
    'Healthcare & Medical',
    'Dental & Veterinary',
    'Home Services & Construction',
    'Food & Beverage',
    'Legal & Professional',
    'Wellness & Fitness',
    'Retail & Shopping',
    'Real Estate',
    'Auto Services',
    'Other'
]

INDUSTRIES = [
    'healthcare', 'dental', 'veterinary', 'home_services', 'construction',
    'roofing', 'hvac', 'plumbing', 'electrical', 'food', 'restaurant',
    'cafe', 'legal', 'accounting', 'wellness', 'fitness', 'spa', 'beauty',
    'retail', 'real_estate', 'auto', 'cleaning', 'landscaping', 'photography', 'other'
]

CONTACT_STATUSES = ['Lead', 'Contacted', 'Replied', 'Qualified', 'Not Interested', 'Converted']
LEAD_TIERS = ['High', 'Medium', 'Low']
LEAD_SOURCES = ['google', 'yelp', 'manual']

OKC_LOCATION = "Oklahoma City, OK"
DEFAULT_SEARCH_RADIUS = 15
DEFAULT_DAILY_EMAIL_LIMIT = 30

DEFAULT_SUBJECT_LINES = [
    "Modernize {{Business}} this quarter?",
    "Quick question about {{Business}}",
    "Refresh your online presence?",
    "Small AI upgrade for {{Business}}?"
]

DEFAULT_EMAIL_TEMPLATE = """Hi there,

I'm reaching out from Everly Studio here in OKC. We help local businesses like {{Business}} with website refreshes, small AI tools, and online presence improvements.

I noticed {{Business}} and thought you might be interested in:
- A modern website refresh
- Simple scheduling/booking tools
- Workflow automation
- Mobile optimization

We're offering 50% off for our first 10 OKC projects this quarter.

Would you like me to send over a quick breakdown of ideas specific to {{Business}}?

No pressure at all—just reply STOP if you'd prefer not to hear from us.

Best,
Everly Studio Team
https://everlystudio.com
"""
