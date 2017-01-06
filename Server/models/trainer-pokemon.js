module.exports = function (sequelize, Sequelize) {
	var TrainerPokemon = sequelize.define('TrainerPokemon', {
		pokemonId: {
			type: Sequelize.STRING(255),
		},
		caught:{
			type:Sequelize.BOOLEAN
		}
	}, {
			classMethods: {
				// associate: function (models) {
				// 	TrainerPokemon.belongsTo(models.Trainer, {
				// 		constraints: false,
				// 		as: 'trainer'
				// 	});
				// }
			}
		});

	return TrainerPokemon;
}