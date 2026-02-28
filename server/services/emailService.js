const sgMail = require('@sendgrid/mail');

// Authenticate with SendGrid using  API key from .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// This function sends one reminder email to a user
//takes all the info it needs as parameters 
async function sendInterviewReminder(toEmail, userName, company, role, interviewDate, daysUntil) {
  
  // Format the raw date ("2025-03-10") to "Monday, March 10, 2025"
  const formattedDate = new Date(interviewDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


  // Building the email object: to, from, subject , and the HTML body
  const msg = {
    to: toEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL, // the sender
      name: 'JAT'                              // name seen in user inbox
    },
    subject: `Interview Reminder — ${company} is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,

    // Email body 
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Reminder 📅</h2>
        <p>Hi ${userName},</p>
        <p>Just a heads-up — you have an upcoming interview:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Company:</strong> ${company}</p>
          <p style="margin: 4px 0;"><strong>Role:</strong> ${role}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>In:</strong> ${daysUntil} day${daysUntil > 1 ? 's' : ''}</p>
        </div>
        <p>Good luck! 🍀</p>
        <p style="color: #999; font-size: 12px;">— JAT, Job Application Tracker</p>
      </div>
    `
  };

  // sending the email (calling SendGrid's API)
  await sgMail.send(msg);
}

// Export so the reminder job can import and use it
module.exports = { sendInterviewReminder };