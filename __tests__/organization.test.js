const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');

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
        imageURL: 'tester url'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'tester title',
          description: 'tester description',
          imageURL: 'tester url',
          __v: 0
        });
      });
  });

  it('gets all organizations via GET', () => {
    return Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageURL: 'tester URL'
    })
      .then(() => request(app).get('/api/v1/organizations/'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'tester title',
          imageURL: 'tester URL'
        }]);
      });

  });

  it('can find a specific organization', () => {
    return Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageURL: 'tester URL'
    })
      .then(organization => request(app).get(`/api/v1/organizations/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'tester title',
          description: 'tester description',
          imageURL: 'tester URL',
          __v: 0
        });
      });
  });

  it(`updates organization by id via PATCH`, () => {
    return Organization.create({
      title: 'tester title',
      description: 'tester description',
      imageURL: 'tester URL'
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
          imageURL: 'tester URL',
          __v: 0
        });
      });
  });

  it(`deletes organization by id via DELETE`, () => {
    return Organization.create(
      {
        title: 'tester title',
        description: 'tester description',
        imageURL: 'tester URL'
      })
      .then(pizza => {
        request(app).delete(`/api/v1/organizations/${pizza._id}`)
          .then(res => {
            expect(res.body).toEqual({
              _id: expect.anything(),
              title: 'tester title',
              description: 'tester description',
              imageURL: 'tester URL',
              __v: 0
            });
          });
      });
  });
});
