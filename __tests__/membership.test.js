const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongodb.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  }); 

  let organization;
  let user;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageURL: 'tester url'
    });

    user = await User.create(
      {
        name: 'tester username',
        phone: '123-456-7890',
        email: 'tester@tester.com',
        communicationMedium: 'email',
        imageUrl: 'tester URL'
      });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongodb.stop();
  }); 
});
