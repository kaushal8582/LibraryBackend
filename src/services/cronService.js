const DAO = require("../dao");
const { STUDENT_MODEL, PAYMENT_MODEL } = require("../utils/constants");
const ejs = require("ejs");
const path = require("path");
const sendEmail = require("../utils/sendMail");

const sendReminderEmails = async () => {
  try {
    console.log("Sending reminder emails...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(today.getDate() + 10);

    console.log("Today:", today);
    console.log("Ten days from now:", tenDaysFromNow);

    // ✅ Step 1: Find students whose payment due date is between today and 10 days ahead
    const students = await DAO.getData(STUDENT_MODEL, {
      isPaymentDoneForThisMonth: false,
      nextDueDate: {
        $gte: today,
        $lte: tenDaysFromNow,
      },
    });

    console.log("Found students:", students);

    // ✅ Step 2: Loop through students and check if a payment order already exists
    for (const student of students) {
      const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;

      const existingPayment = await DAO.findOneData(PAYMENT_MODEL, {
        studentId: student?.userId,
        month: monthKey,
        status: { $in: ["pending", "completed"] },
      });

      if (!existingPayment) {
        // ✅ Step 3: Create Razorpay order if not found
        const receipt = `receipt_${Date.now()}`;
        const notes = {
          studentId: student?.userId.toString(),
          libraryId: student?.libraryId.toString(),
          month: monthKey,
          description: "Library subscription payment",
        };

        const totalAmount = parseFloat(student.fee);

        const razorpayOrder = await createOrder(
          totalAmount,
          "INR",
          receipt,
          notes,
          "production"
        );

        const paymentDataToSave = {
          studentId: student?.userId,
          libraryId: student?.libraryId,
          amount: totalAmount,
          currency: "INR",
          razorpayOrderId: razorpayOrder.id,
          status: "pending",
          description: "Library subscription payment",
          month: monthKey,
          paymentMethod: "razorpay",
        };

        await DAO.createData(PAYMENT_MODEL, paymentDataToSave);
      }
    }

    // ✅ Step 4: Send email to all those students
    // sendBulkReminderEmails(students);

    console.log("Email sent to students:", students);

    const templatePath = path.join(__dirname, "..", "views", "reminder.ejs");

    // ✅ Step 5: Render email template with student name
    for (const student of students) {
      const htmlContent = await ejs.renderFile(templatePath, {
        name: student.name,
      });
      await sendEmail(student.email, "Payment Reminder", htmlContent);
    }
  } catch (error) {
    logger.error("Error sending reminder emails:", error);
  }
};

module.exports = {
  sendReminderEmails,
};