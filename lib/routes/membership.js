const { Router } = require('express');
const Membership = require('../models/Membership');

module.exports = Router()
  .post('/', (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Membership
      .find(req.query)
      .populate('organization', {
        _id: true,
        title: true,
        imageURL: true
      })
      .populate('user', {
        _id: true,
        name: true,
        imageUrl: true
      })
      .then(membership => res.send(membership))
      .catch(next);
  });
