"use strict";

const DAO = require("../dao");
const { LIBRARY_MODEL, USER_MODEL } = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");

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
const getLibraryById = async (id) => {
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id }, {
    plans: 1,
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
  });

  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }

  return library;
};

// Update library
const updateLibrary = async (id, libraryData) => {
  const { userName, profileImg } = libraryData;
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

    const query = {};
    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { address: { $regex: searchText, $options: "i" } },
      ];
    }
    if (facilities) {
      query.facilities = { $in: facilities };
    }
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (rating) {
      query.rating = { $gte: rating };
    }
    if (feeRange) {
      query.$expr = {
        $anyElementTrue: {
          $map: {
            input: "$plans",
            as: "plan",
            in: {
              $lte: [{ $toInt: "$$plan.price" }, feeRange],
            },
          },
        },
      };
    }

    if (sortBy) {
      query.$sort = { [sortBy]: 1 };
    }

    const aggregateQuery = [
      {
        $match: query,
      },
      // {
      //   $sort: query.$sort || {}
      // }
    ];

    const Libraries = await DAO.aggregateData(LIBRARY_MODEL, aggregateQuery);
    return Libraries;
  } catch (error) {
    throw new Error(error.message);
  }
};

async function test(params) {
  const payload = {
    // searchText: 'muriyari',
    // facilities: ['Wi-Fi','Cafe' ],
    name: "Beauty",
    // rating: 4,
    feeRange: 100,
    // sortBy: 'rating',
  };
  const Libraries = await filterLibraryDataForUser(payload);
  console.log("librariesssdat", Libraries);
  return Libraries;
}

test();

module.exports = {
  createLibrary,
  getAllLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  filterLibraryDataForUser,
};
