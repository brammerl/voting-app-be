const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

schema.statics.deleteMembershipandVotes = async function(id) {
  const membership = await this.findById(id);

  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ user: membership.user })
  ])
    .then(([membership]) => membership);
};

schema.statics.membershipCount = function() {
  return this.aggregate([
    {
      '$group': {
        '_id': '$user', 
        'numberOfMemberships': {
          '$sum': 1
        }
      }
    }, {
      '$lookup': {
        'from': 'users', 
        'localField': '_id', 
        'foreignField': '_id', 
        'as': 'memberInfo'
      }
    }, {
      '$unwind': {
        'path': '$memberInfo'
      }
    }, {
      '$project': {
        'numberOfMemberships': 1, 
        'memberInfo': 1
      }
    }, {
      '$project': {
        '_id': 0, 
        'memberInfo._id': 0
      }
    }, {
      '$sort': {
        'numberOfMemberships': -1
      }
    }
  ]);
};

module.exports = mongoose.model('Membership', schema);
