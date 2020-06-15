const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');

describe('voter routes', () => {
  beforeAll(async() => {
    const uri = await mongodb.getUri();
    return connect(uri);
  });

  let poll;
  let user;
  let organization;
  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  }); 

  beforeEach(async() => {
    organization = await Organization.create({
      title: 'org test title',
      description: 'test org description',
      imageUrl: 'test org url'
    });

    poll = await Poll.create({
      organization: organization._id,
      title: 'poll tester title',
      description: 'poll tester description',
      options: ['option1', 'option2', 'option3']
    });

    user = await User.create({
      name: 'test name',
      phone: '123-456-7890',
      email: 'test@test.com',
      communicationMedium: 'email',
      imageUrl: 'test url'
    });
  });
  afterAll(async() => {
    await mongoose.connection.close();
    return mongodb.stop();
  });

  it('create a new vote', async() => {
    return request(app)
      .post('/api/v1/votes/')
      .send({
        user: user._id,
        poll: poll._id,
        option: 'option1'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          user: user.id,
          poll: poll.id,
          option: 'option1',
          __v: 0
        });
      });
  });

  it('gets all votes on a poll', async() => {
    await Vote.create({
      user: user._id,
      poll: poll._id,
      option: 'option1'
    });

    return request(app)
      .get(`/api/v1/votes?poll=${poll._id}`)
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([{
          _id: expect.anything(),
          option: 'option1',
          poll: poll.id,
          user: user.id,
          __v: 0
        }]));
      });
  });
}); 
