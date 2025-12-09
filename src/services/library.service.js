"use strict";

const DAO = require("../dao");
const { LIBRARY_MODEL, USER_MODEL } = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");
const mongoose = require("mongoose");

// Create library
const createLibrary = async (libraryData) => {
  // Check if library with same name exists
  const existingLibrary = await DAO.getOneData(LIBRARY_MODEL, {
    name: libraryData.name,
  });

  if (existingLibrary) {
    throw new Error(ERROR_CODES.LIBRARY_ALREADY_EXISTS.message);
  }

  // Create library
  const result = await DAO.createData(LIBRARY_MODEL, libraryData);
  return result[0];
};

// Get all libraries
const getAllLibraries = async (query = {}) => {
  return await DAO.getData(LIBRARY_MODEL, query);
};

// Get library by ID
// const getLibraryById = async (id) => {
//   const library = await DAO.getOneData(
//     LIBRARY_MODEL,
//     { _id: id },
//     {
//       plans: 1,
//       name: 1,
//       address: 1,
//       contactEmail: 1,
//       contactPhone: 1,
//       heroImg: 1,
//       galleryPhotos: 1,
//       openingHours: 1,
//       closingHours: 1,
//       openForDays: 1,
//       facilities: 1,
//       aboutLibrary: 1,
//     }
//   );

//   if (!library) {
//     throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
//   }

//   return library;
// };

const getLibraryById = async (libraryId, userId) => {
  try {
    const objectId = new mongoose.Types.ObjectId(libraryId);

    // OPTIONAL USER ID FIX
    let userObjectId = null;
    if (userId) {
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } catch (err) {
        userObjectId = null; // Invalid ID fallback
      }
    }

   

    const aggregate = [
      { $match: { _id: objectId } },

      // Librarian
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "libraryId",
          as: "librarian",
          pipeline: [
            { $match: { role: "librarian" } },
            { $project: { password: 0, __v: 0 } },
          ],
        },
      },

      // Reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "libraryId",
          as: "reviews",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                  {
                    $project: {
                      password: 0,
                      __v: 0,
                      role: 0,
                      bio: 0,
                      phone: 0,
                      email: 0,
                      isActive: 0,
                      lastLogin: 0,
                      updatedAt: 0,
                      createdAt: 0,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                userDetails: { $arrayElemAt: ["$userDetails", 0] },
              },
            },
          ],
        },
      },

      // ⭐ isMyReview only when userObjectId exists
      {
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "r",
              in: {
                $mergeObjects: [
                  "$$r",
                  {
                    isMyReview: userObjectId
                      ? { $eq: ["$$r.userId", userObjectId] }
                      : false, // User not logged in → always false
                  },
                ],
              },
            },
          },
        },
      },

      // Sort
      {
        $addFields: {
          reviews: {
            $sortArray: {
              input: "$reviews",
              sortBy: { isMyReview: -1, createdAt: -1 },
            },
          },
        },
      },

      // Rating summary
      {
        $addFields: {
          totalReviews: { $size: "$reviews" },
          avgRating: {
            $cond: [
              { $eq: [{ $size: "$reviews" }, 0] },
              0,
              { $avg: "$reviews.rating" },
            ],
          },
        },
      },

      // Final Projection
      {
        $project: {
          name: 1,
          address: 1,
          contactEmail: 1,
          contactPhone: 1,
          heroImg: 1,
          galleryPhotos: 1,
          openingHours: 1,
          closingHours: 1,
          openForDays: 1,
          facilities: 1,
          aboutLibrary: 1,
          totalReviews: 1,
          avgRating: 1,
          librarian: 1,
          reviews: 1,
          plans: 1,
        },
      },
    ];

    const result = await DAO.aggregateData(LIBRARY_MODEL, aggregate);
    if (!result.length) throw new Error("Library not found");

    return result[0];
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error.message);
  }
};

// Update library
const updateLibrary = async (id, libraryData) => {
  const { userName, profileImg, bio } = libraryData;
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });
  const LibrarianData = await DAO.getOneData(USER_MODEL, {
    libraryId: id,
    role: "librarian",
  });
  if (!LibrarianData) {
    throw new Error("User Not Found");
  }

  const updateData = {};

  if (userName) {
    updateData.name = userName;
  }

  if (profileImg) {
    updateData.avtar = profileImg;
  }
  if (bio) {
    updateData.bio = bio;
  }

  const updateResult = await DAO.updateData(
    USER_MODEL,
    { _id: LibrarianData._id },
    updateData
  );

  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }

  const {
    heroImg,
    galleryPhotos,
    openingHours,
    closingHours,
    openForDays,
    plans,
    facilities,
    name,
    address,
    contactEmail,
    contactPhone,
    aboutLibrary,
    razorPayKey,
    razorPaySecret,
    razorPayWebhookSecret,
    razorPayAccountId,
  } = libraryData;

  const updateLibraryData = {};
  if (heroImg) {
    updateLibraryData.heroImg = heroImg;
  }
  if (galleryPhotos) {
    updateLibraryData.galleryPhotos = galleryPhotos;
  }
  if (openingHours) {
    updateLibraryData.openingHours = openingHours;
  }
  if (closingHours) {
    updateLibraryData.closingHours = closingHours;
  }
  if (openForDays) {
    updateLibraryData.openForDays = openForDays;
  }
  if (plans) {
    updateLibraryData.plans = plans;
  }
  if (facilities) {
    updateLibraryData.facilities = facilities;
  }
  if (name) {
    updateLibraryData.name = name;
  }
  if (address) {
    updateLibraryData.address = address;
  }
  if (contactEmail) {
    updateLibraryData.contactEmail = contactEmail;
  }
  if (contactPhone) {
    updateLibraryData.contactPhone = contactPhone;
  }
  if (aboutLibrary) {
    updateLibraryData.aboutLibrary = aboutLibrary;
  }
  if (razorPayKey) {
    updateLibraryData.razorPayKey = razorPayKey;
  }
  if (razorPaySecret) {
    updateLibraryData.razorPaySecret = razorPaySecret;
  }
  if (razorPayWebhookSecret) {
    updateLibraryData.razorPayWebhookSecret = razorPayWebhookSecret;
  }
  if(razorPayAccountId) {
    updateLibraryData.razorPayAccountId = razorPayAccountId;
  }

  

  return await DAO.updateData(LIBRARY_MODEL, { _id: id }, updateLibraryData);
};

// Delete library
const deleteLibrary = async (id) => {
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });

  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }

  return await DAO.updateData(LIBRARY_MODEL, { _id: id }, { isActive: false });
};

const filterLibraryDataForUser = async (payload) => {
  try {
    const { searchText, facilities, name, rating, feeRange, sortBy } = payload;

    const matchQuery = {};

    // 🔍 Search Filter
    if (searchText) {
      matchQuery.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { address: { $regex: searchText, $options: "i" } },
      ];
    }

    // 🏢 Facilities Filter
    if (facilities && facilities.length > 0) {
      matchQuery.facilities = { $in: facilities };
    }

    // 🔎 Name Filter
    if (name) {
      matchQuery.name = { $regex: name, $options: "i" };
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "libraryId",
          as: "reviews",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { rating: 1 } },
          ],
        },
      },

      {
        $addFields: {
          avgRating: {
            $cond: [
              { $eq: [{ $size: "$reviews" }, 0] },
              0,
              { $avg: "$reviews.rating" },
            ],
          },

          minPrice: {
            $min: {
              $map: {
                input: { $ifNull: ["$plans", []] },
                as: "pl",
                in: { $toInt: "$$pl.price" },
              },
            },
          },
        },
      },

      { $project: { reviews: 0 } },
    ];

    if (rating) {
      pipeline.push({
        $match: {
          avgRating: { $gte: Number(rating) },
        },
      });
    }

    if (feeRange !== undefined && feeRange !== null) {
      pipeline.push({
        $match: {
          minPrice: { $lte: Number(feeRange) },
        },
      });
    }

    // 🔽 Sorting
    if (sortBy) {
      pipeline.push({ $sort: { [sortBy]: 1 } });
    }

    const Libraries = await DAO.aggregateData(LIBRARY_MODEL, pipeline);
    return Libraries;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getFeaturedLibraries = async () => {
  try {
    const pipeline = [
      { $match: { featured: true } },

      // ⭐ Pull Ratings From Reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "libraryId",
          as: "reviews",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { rating: 1 } },
          ],
        },
      },

      // ⭐ Calculate avgRating + minPrice
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $eq: [{ $size: "$reviews" }, 0] },
              0,
              { $avg: "$reviews.rating" }
            ]
          },

          minPrice: {
            $min: {
              $map: {
                input: { $ifNull: ["$plans", []] },
                as: "pl",
                in: { $toInt: "$$pl.price" }
              }
            }
          }
        }
      },

      // ⭐ Only required fields
      {
        $project: {
          name: 1,
          // address: 1,
          // contactEmail: 1,
          // contactPhone: 1,
          heroImg: 1,
          // galleryPhotos: 1,
          // openingHours: 1,
          // closingHours: 1,
          // openForDays: 1,
          facilities: 1,
          // plans: 1,
          avgRating: 1,
          minPrice: 1,
          _id: 1,


        }
      }
    ];

    const result = await DAO.aggregateData(LIBRARY_MODEL, pipeline);
    return result;

  } catch (error) {
    console.error("Featured Error:", error);
    throw new Error(error.message);
  }
};

const getLibraryRazorPayInfo = async (id) => {
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });

  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }



  return library;
};


module.exports = {
  createLibrary,
  getAllLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  filterLibraryDataForUser,
  getFeaturedLibraries,
  getLibraryRazorPayInfo,
};
