import smtplib
import os
from email.message import EmailMessage
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

router = APIRouter()

class EmailRequest(BaseModel):
    user_email: str

@router.post("/send-email")
def send_email():
    mail_host = "smtp.gmail.com" # mail manager host
    port = 587 # standard SMTP submission port (STARTTLS)

    sender_email = "<EMAIL>" # email address that will send mail
    sender_password = os.getenv("GMAIL_APP_PASSWORD") # gmail app password
    recipient_email = "<EMAIL>" # email address that will receive mail

    # compose email
    msg = EmailMessage() # init email obj
    msg["Subject"] = "Planium : A plane is flying near the Moon 🌙" # email subject
    msg["From"] = sender_email    # sender
    msg["To"] = recipient_email        # recipient
    msg.set_content("A plane is about to fly near the moon.") # email content

    # send email
    with smtplib.SMTP(mail_host, port) as smtp:
        smtp.starttls()
        smtp.login(sender_email, sender_password) # login with user credentials
        smtp.send_message(msg)

# send test email
@router.post("/send-test-email")
def send_test_email(request: EmailRequest):
    sender_email = "zzabcmail123@gmail.com"
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_password:
        raise HTTPException(status_code=500, detail="GMAIL_APP_PASSWORD not set")

    msg = EmailMessage()
    msg["Subject"] = "Planium : A plane is flying near the Moon 🌙"
    msg["From"] = sender_email
    msg["To"] = request.user_email
    msg.set_content("A plane is about to fly near the moon.")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))