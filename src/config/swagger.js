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
        },
        CreatePayment: {
          type: 'object',
          required: ['studentId', 'libraryId', 'amount'],
          properties: {
            studentId: {
              type: 'string',
              description: 'Student ID'
            },
            libraryId: {
              type: 'string',
              description: 'Library ID'
            },
            amount: {
              type: 'number',
              description: 'Payment amount'
            },
            currency: {
              type: 'string',
              enum: ['INR'],
              default: 'INR',
              description: 'Currency code'
            },
            description: {
              type: 'string',
              description: 'Payment description'
            },
            month: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Month in YYYY-MM format'
            }
          }
        },
        VerifyPayment: {
          type: 'object',
          required: ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'],
          properties: {
            razorpay_payment_id: {
              type: 'string',
              description: 'Razorpay payment ID'
            },
            razorpay_order_id: {
              type: 'string',
              description: 'Razorpay order ID'
            },
            razorpay_signature: {
              type: 'string',
              description: 'Razorpay signature'
            }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Payment ID'
            },
            studentId: {
              type: 'string',
              description: 'Student ID'
            },
            libraryId: {
              type: 'string',
              description: 'Library ID'
            },
            amount: {
              type: 'number',
              description: 'Payment amount'
            },
            currency: {
              type: 'string',
              description: 'Currency code'
            },
            paymentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Payment date'
            },
            paymentMethod: {
              type: 'string',
              enum: ['razorpay', 'cash', 'other'],
              description: 'Payment method'
            },
            razorpayPaymentId: {
              type: 'string',
              description: 'Razorpay payment ID'
            },
            razorpayOrderId: {
              type: 'string',
              description: 'Razorpay order ID'
            },
            razorpayRefundId: {
              type: 'string',
              description: 'Razorpay refund ID'
            },
            month: {
              type: 'string',
              description: 'Payment month'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Payment status'
            },
            description: {
              type: 'string',
              description: 'Payment description'
            },
            refundAmount: {
              type: 'number',
              description: 'Refund amount'
            },
            refundReason: {
              type: 'string',
              description: 'Refund reason'
            },
            refundDate: {
              type: 'string',
              format: 'date-time',
              description: 'Refund date'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Created at'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Updated at'
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