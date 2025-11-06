'use strict';

const cron = require('node-cron');
const logger = require('../config/logger');
const DAO = require('../dao');
const { REMINDER_MODEL, STUDENT_MODEL } = require('./constants');
const { sendEmail } = require('./sendMail');
const { sendSMS } = require('./sendSMS');

// Schedule reminder job - runs every day at 10:00 AM
const scheduleReminderJob = () => {
  cron.schedule('0 10 * * *', async () => {
    logger.info('Running reminder cron job');
    try {
      // Find all pending reminders
      const pendingReminders = await DAO.getData(REMINDER_MODEL, { status: 'pending' });
      
      for (const reminder of pendingReminders) {
        try {
          // Get student details
          const student = await DAO.getOneData(STUDENT_MODEL, { _id: reminder.studentId });
          
          if (!student) {
            logger.error(`Student not found for reminder: ${reminder._id}`);
            continue;
          }
          
          // Send reminder based on channel
          if (reminder.channel === 'email' || reminder.channel === 'both') {
            if (student.email) {
              await sendEmail(
                student.email,
                'LibTrack Reminder',
                `<p>Dear ${student.name},</p><p>${reminder.message}</p>`
              );
            }
          }
          
          if (reminder.channel === 'sms' || reminder.channel === 'both') {
            if (student.phone) {
              await sendSMS(
                student.phone,
                `LibTrack Reminder: Dear ${student.name}, ${reminder.message}`
              );
            }
          }
          
          // Update reminder status
          await DAO.updateData(REMINDER_MODEL, { _id: reminder._id }, { 
            status: 'sent',
            sentAt: new Date()
          });
          
          logger.info(`Reminder sent to student: ${student.name}`);
        } catch (error) {
          logger.error(`Error processing reminder ${reminder._id}: ${error.message}`);
          
          // Mark as failed
          await DAO.updateData(REMINDER_MODEL, { _id: reminder._id }, { 
            status: 'failed'
          });
        }
      }
    } catch (error) {
      logger.error(`Error in reminder cron job: ${error.message}`);
    }
  });
  
  logger.info('Reminder cron job scheduled');
};

module.exports = {
  scheduleReminderJob
};