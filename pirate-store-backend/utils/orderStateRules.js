const allowedTransitions = {
  pending: ['paid', 'cancelled'],

  paid: ['shipped', 'cancelled'],

  shipped: ['delivered'],

  delivered: [],

  cancelled: []
};

const canTransition = (currentStatus, newStatus) => {
  return allowedTransitions[currentStatus]?.includes(newStatus);
};

module.exports = {
  allowedTransitions,
  canTransition
};