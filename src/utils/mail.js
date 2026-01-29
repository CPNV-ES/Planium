export async function sendEmail(user_email, content) {
    if (!user_email) {
        alert("Please enter a valid email address.");
        return;
    }

    try{
        const res = await fetch("http://localhost:8080/api/send-email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user_email: user_email , content: content}),
        });

        if (!res.ok) throw new Error("Failed to send test email");

        alert("Email sent successfully.");
    } catch (error) {
        alert("Error sending email:" + error.message);
    }
}

export function saveEmail(email) {
    localStorage.setItem("user_email", email);
}

export function getEmail() {
    return localStorage.getItem("user_email");
}