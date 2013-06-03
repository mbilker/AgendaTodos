module.exports = function(models) {
  return {
    checkForUser: require('./checkForUser.js')(models),
  }
}
