from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os

# Disable output buffering
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.contacts import contacts_bp
from api.analytics import analytics_bp
from api.email import email_bp
from api.filters import filters_bp
from api.lead_discovery import lead_discovery_bp
from api.campaigns import campaigns_bp
from config import DEBUG, HOST, PORT

app = Flask(__name__)
CORS(app)

app.register_blueprint(contacts_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(email_bp, url_prefix='/api')
app.register_blueprint(filters_bp, url_prefix='/api')
app.register_blueprint(lead_discovery_bp, url_prefix='/api')
app.register_blueprint(campaigns_bp, url_prefix='/api')

@app.route('/')
def index():
    return jsonify({
        'message': 'Everly Studio Lead Generation Engine API',
        'version': '2.0',
        'endpoints': {
            'contacts': '/api/contacts',
            'analytics': '/api/analytics/dashboard',
            'campaigns': '/api/campaigns',
            'lead_discovery': '/api/lead-discovery/jobs',
            'filters': '/api/filters/options'
        }
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print("=" * 60, flush=True)
    print("🚀 Everly Studio Lead Generation Engine", flush=True)
    print("=" * 60, flush=True)
    print(f"Server running on: http://{HOST}:{PORT}", flush=True)
    print("Press CTRL+C to stop", flush=True)
    print("=" * 60, flush=True)
    app.run(host=HOST, port=PORT, debug=DEBUG)
