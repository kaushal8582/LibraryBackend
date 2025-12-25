/**
 * Migration script to create unique index on Library.contactEmail
 * Run this once to ensure the unique constraint exists
 * 
 * Usage: node src/utils/createUniqueIndex.js
 */

const mongoose = require('mongoose');
const Library = require('../models/library.model');
const config = require('../config/env');

async function createUniqueIndex() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create unique index on contactEmail
    await Library.collection.createIndex(
      { contactEmail: 1 },
      { unique: true, name: 'contactEmail_unique' }
    );
    
    console.log('✅ Unique index created successfully on Library.contactEmail');
    
    // Check for duplicates
    const duplicates = await Library.aggregate([
      {
        $group: {
          _id: '$contactEmail',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length > 0) {
      console.warn('⚠️  Found duplicate libraries:');
      duplicates.forEach(dup => {
        console.warn(`  Email: ${dup._id}, Count: ${dup.count}, IDs: ${dup.ids}`);
      });
      console.warn('Please clean up duplicates before the unique index can be enforced.');
    } else {
      console.log('✅ No duplicate libraries found');
    }

    process.exit(0);
  } catch (error) {
    if (error.code === 85) {
      console.log('✅ Unique index already exists');
      process.exit(0);
    } else if (error.code === 11000) {
      console.error('❌ Cannot create unique index: Duplicate values found');
      console.error('Please remove duplicates first');
      process.exit(1);
    } else {
      console.error('❌ Error creating index:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  createUniqueIndex();
}

module.exports = createUniqueIndex;

