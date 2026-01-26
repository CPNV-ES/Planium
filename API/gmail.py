import smtplib
import os
from email.message import EmailMessage

mail_host = "smtp.gmail.com" # mail manager host
port = 587 # standard SMTP submission port (STARTTLS)

sender_email = "<EMAIL>" # email address that will send mail
sender_password = os.getenv(GMAIL_APP_PASSWORD) # gmail app password
recipient_email = "<EMAIL>" # email address that will receive mail

# compose email
msg = EmailMessage() # init email obj
msg["Subject"] = "Planium : A plane is flying near the Moon 🌙" # email subject
msg["From"] = sender_email    # sender
msg["To"] = recipient_email        # recipient
msg.set_content("A plane is about to fly near the moon.") # email content

# send email
with smtplib.SMTP(mail_host, port) as smtp:
    smtp.login(sender_email, sender_password) # login with user credentials
    smtp.send_message(msg)