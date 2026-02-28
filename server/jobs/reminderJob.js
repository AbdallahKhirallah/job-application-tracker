const cron = require('node-cron');
const pool = require('../config/database');
const { sendInterviewReminder } = require('../services/emailService');


// Logic function , runs once every time it's called by the scheduler
async function checkAndSendReminders() {
  console.log('Running interview reminder check...');

  try {
    // Query the db for all applications where:
    // An interview_date is set
    // The interview is exactly 7 OR 2 days from today
    // JOIN the users table to get their name and email
    const result = await pool.query(`
      SELECT 
        a.id,
        a.company,
        a.role,
        a.interview_date,
        u.name AS user_name,
        u.email AS user_email,
        EXTRACT(DAY FROM (a.interview_date - CURRENT_DATE))::integer AS days_until
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE 
        a.interview_date IS NOT NULL
       AND (a.interview_date::date - CURRENT_DATE::date) IN (7, 2)
    `);


    console.log(`Found ${result.rows.length} interviews to remind about`);

    // Looping through each result and send a reminder email
    for (const row of result.rows) {
      try {
        await sendInterviewReminder(
          row.user_email,
          row.user_name,
          row.company,
          row.role,
          row.interview_date,
          row.days_until
        );
        console.log(`Reminder sent to ${row.user_email} for ${row.company} (in ${row.days_until} days)`);

      } catch (emailError) {
        // if an email fails , log it but continue for the rest
        console.error(`Failed to send reminder to ${row.user_email}:`, emailError.message);
      }
    }


  } catch (dbError) {
    console.error('Error querying DB for reminders:', dbError.message);

  }
}

// Scheduling to run every day at 8 AM
// using Cron format: 'minute hour day month weekday'
// '0 8 * * *' is at minute 0, hour 8, every day
cron.schedule('0 8 * * *', () => {
  checkAndSendReminders();
});



// Exporting the fun
module.exports = { checkAndSendReminders };