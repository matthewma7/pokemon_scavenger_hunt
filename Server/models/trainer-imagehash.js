module.exports = function (sequelize, Sequelize) {
	var TrainerImageHash = sequelize.define('TrainerImageHash', {
		imageHash: {
			type: Sequelize.STRING(255)
		},
	}, {
			classMethods: {
				associate: function (models) {
					TrainerImageHash.belongsTo(models.Trainer, {
						constraints: false,
						as: 'trainer'
					});
				}
			}
		});

	return TrainerImageHash;
}