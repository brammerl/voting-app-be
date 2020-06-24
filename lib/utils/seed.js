const Organization = require('../models/Organization');
const User = require('../models/User');
const Poll = require('../models/Poll');
const Membership = require('../models/Membership');
const Vote = require('../models/Vote');
const chance = require('chance').Chance();


module.exports = async({ orgAmount = 5, userAmount = 100, pollAmount = 10, membershipAmount = 100, voteAmount = 100 } = {}) => {
  const organization = await Promise.all([...Array(orgAmount)].map(() => {
    return Organization.create({
      title: chance.company(),
      description: chance.paragraph({ sentences: 3 }),
      imageUrl: chance.url()
    });
  }));

  const user = await Promise.all([...Array(userAmount)].map(() => {
    return User.create({
      name: chance.name(),
      phone: chance.phone(),
      email: chance.email(),
      communicationMedium: chance.pickone(['phone', 'email']),
      imageUrl: chance.avatar({ protocol: 'https' })
    });
  }));

  const poll = await Promise.all([...Array(pollAmount)].map(() => {
    return Poll.create({
      organization: chance.pickone(organization).id,
      title: chance.string({ length: 5 }),
      description: chance.paragraph({ sentences: 3 }),
      options: [chance.string(), chance.string(), chance.string()]
    });
  }));

  await Promise.all([...Array(membershipAmount)].map(() => {
    return Membership.create({
      organization: chance.pickone(organization).id,
      user: chance.pickone(user).id
    });
  }));

  await Promise.all([...Array(voteAmount)].map(() => {
    const optionArr = chance.pickone(poll).options;
    return Vote.create({
      poll: chance.pickone(poll).id,
      user: chance.pickone(user).id,
      option: chance.pickone(optionArr)
    });
  }));
};

