from pydantic import BaseModel

class EmailRequest(BaseModel):
    user_email: str