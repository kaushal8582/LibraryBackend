"use strict";

const DAO = require("../dao");
const mongoose = require("mongoose");
const {
  PAYMENT_MODEL,
  STUDENT_MODEL,
  LIBRARY_MODEL,
  USER_MODEL,
} = require("../utils/constants");

// Get library dashboard summary
const getLibrarySummary = async (libraryId, month = null) => {
  try {
    // If no month provided, use current month
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    // Validate library exists
    const library = await DAO.getOneData(LIBRARY_MODEL, { _id: libraryId });
    if (!library) {
      throw new Error("Library not found");
    }

    // Get total students in library for the specified month
    const studentCountQuery = {
      libraryId: new mongoose.Types.ObjectId(libraryId),
    };

    const totalStudents = await DAO.count(STUDENT_MODEL, studentCountQuery);

    // Get payment statistics
    const paymentStatsQuery = {
      libraryId: new mongoose.Types.ObjectId(libraryId),
      month: targetMonth,
    };

    const paymentStats = await DAO.aggregateData(PAYMENT_MODEL, [
      {
        $match: paymentStatsQuery,
      },
      {
        $group: {
          _id: null,
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalPending: 1,
          totalPaid: 1,
          totalRevenue: 1,
        },
      },
    ]);

    const stats = paymentStats[0] || {
      totalPending: 0,
      totalPaid: 0,
      totalRevenue: 0,
    };

    // 🧮 Monthly Revenue — with month name like "Nov", "Dec"
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // start from 6 months ago

    // Step 1️⃣: Get revenue data for the last 6 months
    const rawMonthlyData = await DAO.aggregateData(PAYMENT_MODEL, [
      {
        $match: {
          libraryId: new mongoose.Types.ObjectId(libraryId),
          status: "completed",
          paymentDate: { $gte: sixMonthsAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$paymentDate" },
            year: { $year: "$paymentDate" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          monthNumber: "$_id.month",
          year: "$_id.year",
          revenue: 1,
        },
      },
    ]);

    // Step 2️⃣: Create a map for quick lookup
    const revenueMap = new Map();
    rawMonthlyData.forEach((item) => {
      revenueMap.set(`${item.year}-${item.monthNumber}`, item.revenue);
    });

    // Step 3️⃣: Generate last 6 months array (fill missing with 0)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const revenue = revenueMap.get(key) || 0;

      monthlyRevenue.push({
        month: monthNames[date.getMonth()],
        revenue,
      });
    }

    return {
      totalStudents,
      totalPendingPayments: stats.totalPending,
      totalPaidPayments: stats.totalPaid,
      totalRevenue: stats.totalRevenue,
      monthlyRevenue: monthlyRevenue,
    };
  } catch (error) {
    throw new Error(`Failed to get library summary: ${error.message}`);
  }
};

// Get library analytics data
const getLibraryAnalytics = async (
  libraryId,
  startDate = null,
  endDate = null
) => {
  try {
    // Validate library exists
    const library = await DAO.getOneData(LIBRARY_MODEL, { _id: libraryId });
    if (!library) {
      throw new Error("Library not found");
    }

    // Set default date range to last 30 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Payment trends by date
    const paymentTrends = await DAO.aggregateData(PAYMENT_MODEL, [
      {
        $match: {
          libraryId: new mongoose.Types.ObjectId(libraryId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          completed: 1,
          pending: 1,
          failed: 1,
        },
      },
    ]);

    // Revenue by month
    const revenueByMonth = await DAO.aggregateData(PAYMENT_MODEL, [
      {
        $match: {
          libraryId: new mongoose.Types.ObjectId(libraryId),
          status: "completed",
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, // Last 12 months
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"],
              },
            },
          },
          revenue: 1,
        },
      },
    ]);

    // Student growth by month
    const studentGrowth = await DAO.aggregateData(STUDENT_MODEL, [
      {
        $match: {
          libraryId: new mongoose.Types.ObjectId(libraryId),
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"],
              },
            },
          },
          count: 1,
        },
      },
    ]);

    return {
      paymentTrends,
      revenueByMonth: revenueByMonth.reverse(),
      studentGrowth: studentGrowth.reverse(),
    };
  } catch (error) {
    throw new Error(`Failed to get library analytics: ${error.message}`);
  }
};

module.exports = {
  getLibrarySummary,
  getLibraryAnalytics,
};
