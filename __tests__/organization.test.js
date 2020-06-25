const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Poll = require('../lib/models/Poll');

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

  it('creates organization via POST', () => {
    return request(app)
      .post('/api/v1/organizations/')
      .send({
        title: 'tester title',
        description: 'tester description',
        imageUrl: 'tester url'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'tester title',
          description: 'tester description',
          imageUrl: 'tester url',
          __v: 0
        });
      });
  });

  it('gets all organizations via GET', async() => {
    await Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageUrl: 'tester URL'
    });
    return request(app)
      .get('/api/v1/organizations/')
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'tester title',
          imageUrl: 'tester URL'
        }]);
      });
  });

  it('can find a specific organization', () => {
    return Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageUrl: 'tester URL'
    })
      .then(organization => request(app).get(`/api/v1/organizations/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'tester title',
          description: 'tester description',
          imageUrl: 'tester URL',
          __v: 0
        });
      });
  });

  it(`updates organization by id via PATCH`, () => {
    return Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageUrl: 'tester URL'
    })
      .then(organization => {
        return request(app)
          .patch(`/api/v1/organizations/${organization._id}`)
          .send({ description: 'new description' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'tester title',
          description: 'new description',
          imageUrl: 'tester URL',
          __v: 0
        });
      });
  });

  it(`deletes org and all polls/votes associated via DELETE`, async() => {
    const org = await Organization.create({
      title: 'org title',
      description: 'org description',
      imageUrl: 'org url'
    });

    const poll1 = await Poll.create({
      organization: org._id,
      title: 'poll1 title',
      description: 'poll1 description',
      option: ['opt1', 'opt2'],
      imageurl: 'poll1 url'
    });

    const poll2 = await Poll.create({
      organization: org._id,
      title: 'poll2 title',
      description: 'poll2 description',
      option: ['opt1', 'opt2'],
      imageurl: 'poll2 url'
    });

    const user = await User.create({
      name: 'user1',
      phone: '123-456-7890',
      email: 'tester@test.com',
      communicationMedium: 'email',
      imageUrl: 'user url'
    });

    await Vote.create([{
      poll: poll1._id,
      user: user._id,
      option: 'option1'
    }, {
      poll: poll2._id,
      user: user._id,
      option: 'option2'
    }]);

    return request(app)
      .delete(`/api/v1/organizations/${org._id}`)
  
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: org.title,
          description: org.description,
          imageUrl: org.imageUrl,
          __v: 0
        });

        return Poll.find({ organization: org._id });
      });
  });
});
