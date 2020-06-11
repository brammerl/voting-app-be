const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

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

  it(`creates the membership via POST`, () => {
    return request(app)
      .post('/api/v1/memberships/')
      .send({
        organization: organization._id,
        user: user._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  it(`gets all memberships with organization id via GET`, () => {
    return Membership.create({
      organization: organization._id,
      user: user._id
    })
      .then((organization) => request(app).get(`/api/v1/memberships?org=${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: organization.title,
            imageURL: organization.imageURL
          },
          user: {
            _id: user.id,
            name: user.name,
            imageUrl: user.imageUrl
          },
          __v: 0 
        });
      });
  });
});
