var express = require('express');
var models = require('../models');
var moment = require('moment');
var Quagga = require('quagga').default;
var base64Decoder = require("./base64Decoder");
var fs = require("fs");
var pokemonMapping = require("../pokemon-mapping");


var routes = function () {

	var router = express.Router();

	router.route('/scan')
		.post((req, res) => {
			var trainerEmail = new Buffer(req.headers['authorization'], 'base64').toString();
			var code = req.body.code;
			var imageHash = req.body.imageHash;
			models.TrainerImageHash.findOne({
				where: {
					imageHash: imageHash,
					trainerEmail: trainerEmail
				}
			})
				.then(trainerImageHash => {
					if (trainerImageHash) {
						res.json({ type: "duplicateimage" });
					}
					else {
						models.TrainerImageHash.create({
							imageHash: imageHash,
							trainerEmail: trainerEmail
						});
						if (code != "shop") {
							if (pokemonMapping[code]) {
								catchPokemon(trainerEmail, code, imageHash)
									.then(result => res.json(result));
							}
							else {
								res.json({
									type: "invalidscan"
								})
							}
						}
						else {
							arriveShop(trainerEmail)
								.then(result => res.json(result));
						}
					}
				})
		});


	function catchPokemon(trainerEmail, pokemonId) {
		return models.Trainer.findOne({ where: { email: trainerEmail } })
			.then(trainer => {
				if (trainer.pokeball <= 0) {
					return {
						type: "nopokeball",
					}
				}
				else {
					var caught = Math.floor((Math.random() * 10)) <= 3;
					trainer.pokeball--;
					trainer.save();
					return models.TrainerPokemon.create({
						trainerEmail: trainerEmail,
						pokemonId: pokemonId,
						caught: caught
					})
						.then(trainerPokemon => {
							return {
								type: "catch",
								pokemonId: trainerPokemon.pokemonId,
								caught: trainerPokemon.caught,
								pokemonName: pokemonMapping[pokemonId]
							};
						})
				}
			})
	}

	function arriveShop(trainerEmail) {
		var newCount = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
		return models.Trainer.findOne({ where: { email: trainerEmail } })
			.then(trainer => {

				trainer.pokeball += newCount;
				return trainer.save()
			})
			.then(trainer => {
				return {
					type: "addpokeball",
					count: newCount
				}
			})
	}

	router.route('/catch2')
		.post((req, res) => {
			Quagga.decodeSingle({
				decoder: {
					readers: ["code_128_reader"]
				},
				inputStream: {
					size: 800  // restrict input-size to be 800px in width (long-side)
				},
				locate: false,
				src: req.body.base64Image,
				numOfWorkers: 0
			}, re => {
				if (re && re.codeResult) {
					var pokemonId = parseInt(re.codeResult.code.replace(/0/g, ""));
					var imageHash = hashCode(req.body.base64Image);
					console.log(pokemonId, imageHash);
					// models.findOne()
				} else {
					// this.result = "not detected";
					console.log("not detected");
				}
			});
			// console.log(req.body.pokemonId);
			res.sendStatus(200);
		});

	router.route("/status")
		.get((req, res) => {
			var trainerEmail = new Buffer(req.headers['authorization'], 'base64').toString();
			models.Trainer.findOne({ where: { email: trainerEmail } })
				.then(trainer => {
					return models.TrainerPokemon.findAll({
						attributes: ['pokemonId', [models.sequelize.fn('COUNT', 'Post.pokemonId'), 'count']],
						group: ['TrainerPokemon.pokemonId'],
						order: [["pokemonId", "ASC"]],
						where: { caught: true, trainerEmail: trainer.email }
					})
						.then((aggregatedTrainerPokemons) => [trainer, aggregatedTrainerPokemons])
				})
				.then(args => {
					var [trainer, aggregatedTrainerPokemons] = args;
					var formattedAggregatedTrainerPokemons = [];
					aggregatedTrainerPokemons.forEach(aggregatedTrainerPokemon => {
						formattedAggregatedTrainerPokemons.push({
							id: aggregatedTrainerPokemon.pokemonId,
							count: aggregatedTrainerPokemon.get("count"),
							name: pokemonMapping[aggregatedTrainerPokemon.pokemonId]
						})
					});
					res.json({
						trainer: {
							email: trainer.email,
							name: trainer.name,
							pokeball: trainer.pokeball
						},
						pokemons: formattedAggregatedTrainerPokemons
					});
				})
		});

	router.route("/auth")
		.post((req, res) => {
			var trainerEmail = new Buffer(req.headers['authorization'], 'base64').toString();
			models.Trainer.findOne({ where: { email: trainerEmail } })
				.then(trainer => {
					if (trainer) {
						res.sendStatus(200);
					}
					else {
						res.sendStatus(401);
					}
				})
		});

	router.route("/leaderboard")
		.get((req, res) => {
			models.Trainer.findAll({
				include: [{
					attributes: ["pokemonId", [models.sequelize.fn('COUNT', 'pokemonId'), 'count']],
					model: models.TrainerPokemon,
					as: "trainerPokemons",
					where: {
						"caught": true
					}
				}],
				group: ['trainerEmail', 'pokemonId']
			})
				.then(trainers => {
					res.json(trainers);
				})
		});


	return router;
}

function hashCode(str) {
	var hash = 0, i, chr, len;
	if (str.length === 0) return hash;
	for (i = 0, len = str.length; i < len; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

module.exports = routes;