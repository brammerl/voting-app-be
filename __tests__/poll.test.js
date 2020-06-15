const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongodb.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  }); 

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageUrl: 'tester url'
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongodb.stop();
  }); 

  it(`creates new poll via POST`, () => {
    return request(app)
      .post('/api/v1/polls/')
      .send({
        organization: organization._id,
        title: 'poll tester title',
        description: 'poll tester description',
        options: ['option1', 'option2', 'option3']
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'poll tester title',
          description: 'poll tester description',
          options: ['option1', 'option2', 'option3'],
          __v: 0
        });
      });
  });

  it(`gets all polls for an organization via GET`, () => {
    return Poll.create({
      organization: organization._id,
      title: 'poll tester title',
      description: 'poll tester description',
      options: ['option1', 'option2', 'option3'] 
    })
      .then(() => request(app)
        .get(`/api/v1/polls/`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'poll tester title'
        }]);
      });
  });

  it(`gets a poll by id via GET`, () => {
    return Poll.create({
      organization: organization._id,
      title: 'poll tester title',
      description: 'poll tester description',
      options: ['option1', 'option2', 'option3']
    })
      .then(poll => request(app)
        .get(`/api/v1/polls/${poll._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: 'tester title'
          },
          title: 'poll tester title',
          description: 'poll tester description',
          options: ['option1', 'option2', 'option3'],
          __v: 0
        });
      });
  });

  it(`updates a polls title or description via PATCH`, () => {
    return Poll.create({
      organization: organization._id,
      title: 'poll tester title',
      description: 'poll tester description',
      options: ['option1', 'option2', 'option3']
    })
      .then((poll) => {return request(app)
        .patch(`/api/v1/polls/${poll._id}`)
        .send({ description: 'updated polldescription', title: 'updated poll title' })
        .then(res => {
          expect(res.body).toEqual({
            _id: expect.anything(),
            organization: organization.id,
            title: 'updated poll title',
            description: 'updated polldescription',
            options: ['option1', 'option2', 'option3'],
            __v: 0
          });
        });
      });
  });

  it(`deletes poll by id via DELETE`, () => {
    return Poll.create({
      organization: organization._id,
      title: 'poll tester title',
      description: 'poll tester description',
      options: ['option1', 'option2', 'option3']
    })
      .then((poll) => {
        return request(app)
          .delete(`/api/v1/polls/${poll._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'poll tester title',
          description: 'poll tester description',
          options: ['option1', 'option2', 'option3'],
          __v: 0
        });
      });
  });
});
