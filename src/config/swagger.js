'use strict';

const swaggerJsDoc = require('swagger-jsdoc');
const { PORT } = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LibTrack API',
      version: '1.0.0',
      description: 'LibTrack API Documentation',
      contact: {
        name: 'LibTrack Support',
        email: 'support@libtrack.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['admin', 'librarian', 'user'],
              description: 'User role'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            libraryId: {
              type: 'string',
              description: 'Library ID'
            }
          }
        },
        Library: {
          type: 'object',
          required: ['name', 'address', 'city', 'state', 'zipCode', 'email', 'phone'],
          properties: {
            name: {
              type: 'string',
              description: 'Library name'
            },
            address: {
              type: 'string',
              description: 'Library address'
            },
            city: {
              type: 'string',
              description: 'Library city'
            },
            state: {
              type: 'string',
              description: 'Library state'
            },
            zipCode: {
              type: 'string',
              description: 'Library zip code'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Library email'
            },
            phone: {
              type: 'string',
              description: 'Library phone number'
            },
            subscriptionStatus: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Library subscription status'
            },
            settings: {
              type: 'object',
              properties: {
                reminderFrequency: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly'],
                  description: 'Reminder frequency'
                },
                paymentGateway: {
                  type: 'string',
                  enum: ['razorpay', 'stripe', 'paypal'],
                  description: 'Payment gateway'
                },
                notificationChannels: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['email', 'sms', 'push']
                  },
                  description: 'Notification channels'
                }
              }
            }
          }
        },
        LibraryUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Library name'
            },
            address: {
              type: 'string',
              description: 'Library address'
            },
            city: {
              type: 'string',
              description: 'Library city'
            },
            state: {
              type: 'string',
              description: 'Library state'
            },
            zipCode: {
              type: 'string',
              description: 'Library zip code'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Library email'
            },
            phone: {
              type: 'string',
              description: 'Library phone number'
            },
            subscriptionStatus: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
              description: 'Library subscription status'
            },
            settings: {
              type: 'object',
              properties: {
                reminderFrequency: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly'],
                  description: 'Reminder frequency'
                },
                paymentGateway: {
                  type: 'string',
                  enum: ['razorpay', 'stripe', 'paypal'],
                  description: 'Payment gateway'
                },
                notificationChannels: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['email', 'sms', 'push']
                  },
                  description: 'Notification channels'
                }
              }
            },
            isActive: {
              type: 'boolean',
              description: 'Library active status'
            }
          }
        },
        Student: {
          type: 'object',
          required: ['name', 'email', 'phone', 'address', 'libraryId', 'studentId', 'course', 'semester'],
          properties: {
            name: {
              type: 'string',
              description: 'Student name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Student email'
            },
            phone: {
              type: 'string',
              description: 'Student phone number'
            },
            address: {
              type: 'string',
              description: 'Student address'
            },
            libraryId: {
              type: 'string',
              description: 'Library ID'
            },
            studentId: {
              type: 'string',
              description: 'Student ID assigned by the institution'
            },
            course: {
              type: 'string',
              description: 'Course name'
            },
            semester: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Current semester'
            },
            borrowedBooks: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of borrowed book IDs'
            }
          }
        },
        StudentUpdate: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Student name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Student email'
            },
            phone: {
              type: 'string',
              description: 'Student phone number'
            },
            address: {
              type: 'string',
              description: 'Student address'
            },
            course: {
              type: 'string',
              description: 'Course name'
            },
            semester: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Current semester'
            },
            borrowedBooks: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of borrowed book IDs'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;