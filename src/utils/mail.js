export async function sendTestEmail(emailCheck, user_email) {
    if (!emailCheck) {
        alert("Please check the box to receive email notifications.");
        return;
    }
    if (!user_email) {
        alert("Please enter a valid email address.");
        return;
    }

    try{
        const res = await fetch("http://localhost:8080/api/send-test-email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user_email: user_email }),
        });

        if (!res.ok) throw new Error("Failed to send test email");

        alert("Test email sent successfully.");
    } catch (error) {
        alert("Error sending email:" + error.message);
    }
}