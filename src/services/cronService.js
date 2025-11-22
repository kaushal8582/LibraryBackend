const DAO = require("../dao");
const { STUDENT_MODEL, PAYMENT_MODEL } = require("../utils/constants");
const ejs = require("ejs");
const path = require("path");
const sendEmail = require("../utils/sendMail");
const {
  createOrder,
  verifyPayment: verifyRazorpaySignature,
  razorpayInstance,
} = require("../utils/razorpayClient");

const sendReminderEmails = async () => {
  try {
    console.log("Sending reminder emails...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 10 days ahead
    const tenDaysAhead = new Date(today);
    tenDaysAhead.setDate(today.getDate() + 10);

    // 10 days behind
    const tenDaysBehind = new Date(today);
    tenDaysBehind.setDate(today.getDate() - 10);

    // Find students whose due date is within ±10 days of today
    

    const aggregate =[
      {
        $match: {
          isPaymentDoneForThisMonth: false,
          nextDueDate: {
            $gte: tenDaysBehind,
            $lte: tenDaysAhead,
          },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        }
      },
      {
        $unwind: "$user",
      },
    ]

const students  = await DAO.aggregateData(STUDENT_MODEL, aggregate);

    console.log("Found students:", students);

    // ✅ Step 2: Loop through students and check if a payment order already exists
    for (const student of students) {
      const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;

      const existingPayment = await DAO.getOneData(PAYMENT_MODEL, {
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
        name: student.user.name,
        websiteLink : "https://librayr.vercel.app",
      });
      await sendEmail(student.user.email, "Payment Reminder", htmlContent);
    }
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
};

module.exports = {
  sendReminderEmails,
};
