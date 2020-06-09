const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('organization routes', () => {
  beforeAll(async() => {
    const uri = await mongodb.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  }); 

  afterAll(async() => {
    await mongoose.connection.close();
    return mongodb.stop();
  }); 

  it(`gets the user id via GET`, () => {
    return User.create({
      name: 'tester username',
      phone: '123-456-7890',
      email: 'tester@tester.com',
      communicationMedium: 'email',
      imageUrl: 'tester URL'
    })
      .then(user => request(app).get(`/api/v1/users/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'tester username',
          phone: '123-456-7890',
          email: 'tester@tester.com',
          communicationMedium: 'email',
          imageUrl: 'tester URL',
          __v: 0
        });
      });
  });

  it(`updates user information via PATCH`, () => {
    return User.create({
      name: 'tester username',
      phone: '123-456-7890',
      email: 'tester@tester.com',
      communicationMedium: 'email',
      imageUrl: 'tester URL'
    })
      .then(user => {
        return request(app)
          .patch(`/api/v1/users/${user._id}`)
          .send({ email: 'tester2@tester.com' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'tester username',
          phone: '123-456-7890',
          email: 'tester2@tester.com',
          communicationMedium: 'email',
          imageUrl: 'tester URL',
          __v: 0
        });
      });
  });

  it(`deletes user by id`, () => {
    User.create({
      name: 'tester username',
      phone: '123-456-7890',
      email: 'tester@tester.com',
      communicationMedium: 'email',
      imageUrl: 'tester URL'
    })
      .then(user => request(app)
        .delete(`api/v1/users/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({
          
          _id: expect.anything(),
          name: 'tester username',
          phone: '123-456-7890',
          email: 'tester@tester.com',
          communicationMedium: 'email',
          imageUrl: 'tester URL',
          __v: 0
        });
      });
  });
});

