var models = require('./models');
var crypto = require('crypto');

module.exports = function () {
	models.Trainer.findOne({ where: { email: 'test@test.com' } })
		.then(function (trainer) {
			if (!trainer) {
				var users = [{ name: "Matthew Ma", email: "test@test.com" }];
				users.forEach(user => {
					user.pokeball = 15;
				});

				models.Trainer.bulkCreate(users)
			}
		})
}