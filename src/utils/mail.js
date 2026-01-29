// Uses backend api route to post email data (subscription check and user's address)
export async function sendTestEmail(emailCheck, user_email) {
    if (!emailCheck) {
        alert("Please check the box to receive email notifications.");
        return;
    }
    if (!user_email) {
        alert("Please enter a valid email address."); // Basic email security (TODO: improve email recognition)
        return;
    }

    try{
        const res = await fetch("http://localhost:8080/api/send-test-email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user_email: user_email }), // POST user's address to email route
        });

        if (!res.ok) throw new Error("Failed to send test email"); // check res state

        alert("Test email sent successfully.");
    } catch (error) {
        alert("Error sending email:" + error.message);
    }
}