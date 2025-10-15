# Marketing Dashboard

A comprehensive marketing outreach and contact management dashboard.

## Features

- ✅ Contact Management (Add, Edit, Delete, View)
- ✅ Duplicate Detection
- ✅ Email Outreach Tracking
- ✅ Advanced Filtering (Job Category, Status, Search)
- ✅ Analytics Dashboard (Conversion Rates, Reply Rates, etc.)
- ✅ Notes & Activity Timeline
- ✅ Manual Touch Logging
- ✅ Beautiful, Modern UI

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Activate virtual environment:
```bash
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows
```

3. Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

4. Initialize the database (if not already done):
```bash
python database/db_setup.py
```

5. Start the backend server:
```bash
python app.py
```

The backend will run on http://localhost:5001

### Frontend Setup

1. Open `frontend/public/index.html` in your web browser
   - You can simply double-click the file
   - Or use a local server (recommended)

2. Using Python's built-in server (recommended):
```bash
cd frontend/public
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser

## Usage

1. **Add Contacts**: Click "+ Add Contact" button
2. **Search & Filter**: Use the search bar and filter sidebar
3. **View Details**: Click on any contact row
4. **Send Emails**: Select contacts and click "Email" button
5. **Track Progress**: View analytics page for conversion metrics

## Email Configuration (Optional)

To actually send emails (not just log them), edit `backend/config.py`:
```python
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USER = 'your-email@gmail.com'
EMAIL_PASSWORD = 'your-app-password'
```

Then in `backend/services/email_service.py`, set `send_actual_email=True`

## Tech Stack

**Backend:**
- Python 3.13
- Flask (Web Framework)
- SQLAlchemy (Database ORM)
- SQLite (Database)

**Frontend:**
- HTML5
- CSS3 (Modern, responsive design)
- Vanilla JavaScript (No frameworks!)

## Project Structure
```
Marketing/
├── backend/
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── database/         # Database setup
│   └── app.py           # Main Flask app
├── frontend/
│   ├── public/          # HTML files
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page controllers
│       ├── styles/      # CSS files
│       └── utils/       # Helper functions
└── data/                # SQLite database
```

## API Endpoints

- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `POST /api/contacts/:id/notes` - Add note
- `POST /api/email/send` - Send/log email
- `GET /api/analytics/dashboard` - Get analytics
- `GET /api/filters/options` - Get filter options

## Future Enhancements

- CSV Import/Export
- Email Templates
- Bulk Actions
- Advanced Reporting
- Calendar Integration
- Web Scraping Tools
- Mobile Responsive Design
- User Authentication

## Support

For issues or questions, check the code comments or create an issue.

---

Built with ❤️ for efficient marketing outreach!
