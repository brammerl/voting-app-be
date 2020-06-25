//votes by poll
[
  {
    '$group': {
      '_id': '$poll', 
      'totalVotes': {
        '$sum': 1
      }
    }
  }, {
    '$lookup': {
      'from': 'polls', 
      'localField': '_id', 
      'foreignField': '_id', 
      'as': 'poll'
    }
  }, {
    '$unwind': {
      'path': '$poll'
    }
  }, {
    '$lookup': {
      'from': 'organizations', 
      'localField': 'poll.organization', 
      'foreignField': '_id', 
      'as': 'organization'
    }
  }, {
    '$project': {
      'totalVotes': 1, 
      'poll.title': 1, 
      'organization.title': 1
    }
  }, {
    '$unwind': {
      'path': '$organization'
    }
  }
]

//votes by option 
[
  {
    '$group': {
      '_id': {
        'option': '$option', 
        'poll': '$poll'
      }, 
      'votes': {
        '$sum': 1
      }
    }
  }, {
    '$lookup': {
      'from': 'polls', 
      'localField': '_id.poll', 
      'foreignField': '_id', 
      'as': 'poll'
    }
  }, {
    '$unwind': {
      'path': '$poll'
    }
  }, {
    '$lookup': {
      'from': 'organizations', 
      'localField': 'poll.organization', 
      'foreignField': '_id', 
      'as': 'organization'
    }
  }, {
    '$unwind': {
      'path': '$organization'
    }
  }, {
    '$project': {
      '_id.option': 1, 
      'votes': 1, 
      'poll.title': 1, 
      'organization.title': 1
    }
  }
]

//number of members in organization
[
  {
    '$group': {
      '_id': '$organization', 
      'members': {
        '$sum': 1
      }
    }
  }, {
    '$lookup': {
      'from': 'organizations', 
      'localField': '_id', 
      'foreignField': '_id', 
      'as': 'organization'
    }
  }, {
    '$unwind': {
      'path': '$organization'
    }
  }, {
    '$project': {
      '_id': 0, 
      'organization._id': 0, 
      'organization.__v': 0
    }
  }
]

//number of memberships per user from most to least
[
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
]