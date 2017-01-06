module.exports = function (sequelize, Sequelize) {
	var Trainer = sequelize.define('Trainer', {
		email: {
			type: Sequelize.STRING(255),
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(255),
		},
		pokeball: {
			type: Sequelize.INTEGER
		}
	}, {
			classMethods: {
				associate: function (models) {
					Trainer.hasMany(models.TrainerPokemon, {
						constraints: false,
						as: 'trainerPokemons',
						foreignKey: 'trainerEmail'
					});
				}
			}
		});

	return Trainer;
}