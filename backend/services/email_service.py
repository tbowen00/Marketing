import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import get_session
from models.contact import Contact
from models.outreach import Outreach
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD

class EmailService:
    
    @staticmethod
    def send_email(contact_ids, subject, message, send_actual_email=False):
        """
        Send email to contacts and log the outreach
        Set send_actual_email=True to actually send emails (requires EMAIL config)
        """
        session = get_session()
        results = []
        
        try:
            for contact_id in contact_ids:
                contact = session.query(Contact).filter(Contact.id == contact_id).first()
                
                if not contact:
                    results.append({
                        'contact_id': contact_id,
                        'success': False,
                        'error': 'Contact not found'
                    })
                    continue
                
                # Log the outreach
                outreach = Outreach(
                    contact_id=contact.id,
                    outreach_type='Email',
                    subject=subject,
                    message=message,
                    sent_at=datetime.utcnow()
                )
                session.add(outreach)
                
                # Update contact
                contact.total_touches += 1
                contact.last_contacted = datetime.utcnow()
                
                # Actually send email if configured
                email_sent = False
                if send_actual_email and EMAIL_USER and EMAIL_PASSWORD:
                    try:
                        email_sent = EmailService._send_smtp_email(
                            contact.email, subject, message
                        )
                    except Exception as e:
                        print(f"Email send error: {e}")
                
                session.commit()
                
                results.append({
                    'contact_id': contact.id,
                    'contact_name': contact.name,
                    'contact_email': contact.email,
                    'success': True,
                    'email_actually_sent': email_sent,
                    'outreach_logged': True
                })
            
            return {
                'success': True,
                'results': results
            }
        
        except Exception as e:
            session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()
    
    @staticmethod
    def _send_smtp_email(to_email, subject, message):
        """Actually send email via SMTP"""
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(message, 'plain'))
        
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    
    @staticmethod
    def log_manual_outreach(contact_id, outreach_type='Call', notes=''):
        """Log a manual outreach (call, meeting, etc.)"""
        session = get_session()
        try:
            contact = session.query(Contact).filter(Contact.id == contact_id).first()
            
            if not contact:
                return {'success': False, 'error': 'Contact not found'}
            
            # Log the outreach
            outreach = Outreach(
                contact_id=contact.id,
                outreach_type=outreach_type,
                message=notes,
                sent_at=datetime.utcnow()
            )
            session.add(outreach)
            
            # Update contact
            contact.total_touches += 1
            contact.last_contacted = datetime.utcnow()
            
            session.commit()
            
            return {'success': True, 'contact': contact.to_dict()}
        
        except Exception as e:
            session.rollback()
            return {'success': False, 'error': str(e)}
        finally:
            session.close()
