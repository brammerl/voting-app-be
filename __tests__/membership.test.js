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
      imageUrl: 'tester url'
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

  it(`gets all memberships with organization id via GET`, async() => {
    await Membership.create({
      organization: organization._id,
      user: user._id
    });
    return request(app)
      .get(`/api/v1/memberships?organization=${organization._id}`)
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: organization.title,
            imageUrl: organization.imageUrl
          },
          user: {
            _id: user.id,
            name: user.name,
            email: user.email
          },
          __v: 0 
        }]);
      });
  });

  it(`lists organizations an user is a part of via GET`, async() => {
    const org1 = await Organization.create({
      title: 'org1',
      description: 'org1 description',
      imageUrl: 'org1 url'
    });
    const org2 = await Organization.create({
      title: 'org2',
      description: 'org2 description',
      imageUrl: 'org2 url'
    });

    await Membership.create({
      organization: org1._id,
      user: user._id
    });

    await Membership.create({
      organization: org2._id,
      user: user._id
    });

    return request(app)
      .get(`/api/v1/memberships?user=${user._id}`)
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          organization: {
            _id: org1.id,
            title: 'org1',
            imageUrl: 'org1 url'
          },
          user: {
            _id: user.id,
            email: user.email,
            name: user.name
          },
          __v: 0
        }, 
        {
          _id: expect.anything(),
          organization: {
            _id: org2.id,
            title: 'org2',
            imageUrl: 'org2 url'
          },
          user: {
            _id: user.id,
            email: user.email,
            name: user.name
          },
          __v: 0
        }]);
      });
  });
});
