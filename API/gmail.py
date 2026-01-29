import smtplib
import os
from email.message import EmailMessage
from fastapi import APIRouter, HTTPException, Body
from models.EmailRequest import EmailRequest
"""
Email backend
Function: send alert email to user's address (containing plane and event data)
TEST: send fixed alert email to user's address
params: 
    - request
"""
router = APIRouter()

# Main send email function (TODO)
@router.post("/send-email")
def send_email():
    recipient_email = "<EMAIL>" # email address that will receive mail
    sender_email = "<EMAIL>" # email address that will send mail
    sender_password = os.getenv("GMAIL_APP_PASSWORD") # gmail app password

    # TODO: adapt message to event parameters (plane id, coordinates, time, etc)
    # compose email
    msg = EmailMessage() # init email obj
    msg["Subject"] = "Planium : A plane is flying near the Moon 🌙" # email subject
    msg["From"] = sender_email    # sender
    msg["To"] = recipient_email        # recipient
    msg.set_content("A plane is about to fly near the moon.") # email content

    # send email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# TEST : send fixed email from private address
# TEST PASSED SUCCESSFULLY
@router.post("/send-test-email")
def send_test_email(request: EmailRequest):
    recipient_email = request.user_email # email address that will receive mail
    sender_email = "zzabcmail123@gmail.com" # email address that will send mail
    sender_password = os.getenv("GMAIL_APP_PASSWORD") # gmail app password

    if not sender_password:
        raise HTTPException(status_code=500, detail="GMAIL_APP_PASSWORD not set")

    msg = EmailMessage() # init email obj
    msg["Subject"] = "Planium : A plane is flying near the Moon 🌙" # email subject
    msg["From"] = sender_email # sender
    msg["To"] = recipient_email # recipient
    msg.set_content("A plane is about to fly near the moon.") # email content

    # send email
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))