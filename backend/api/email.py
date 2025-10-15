from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.email_service import EmailService

email_bp = Blueprint('email', __name__)

@email_bp.route('/email/send', methods=['POST'])
def send_email():
    """Send email to contacts"""
    try:
        data = request.json
        
        contact_ids = data.get('contact_ids', [])
        subject = data.get('subject', '')
        message = data.get('message', '')
        
        if not contact_ids:
            return jsonify({
                'success': False,
                'error': 'No contacts specified'
            }), 400
        
        # For now, we'll just log the outreach (not actually send)
        # Set send_actual_email=True when email config is set up
        result = EmailService.send_email(
            contact_ids=contact_ids,
            subject=subject,
            message=message,
            send_actual_email=False
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@email_bp.route('/email/log-touch', methods=['POST'])
def log_touch():
    """Manually log an outreach touch (call, meeting, etc.)"""
    try:
        data = request.json
        
        contact_id = data.get('contact_id')
        outreach_type = data.get('outreach_type', 'Call')
        notes = data.get('notes', '')
        
        if not contact_id:
            return jsonify({
                'success': False,
                'error': 'Contact ID required'
            }), 400
        
        result = EmailService.log_manual_outreach(
            contact_id=contact_id,
            outreach_type=outreach_type,
            notes=notes
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
