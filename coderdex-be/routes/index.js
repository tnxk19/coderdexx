var express = require('express');
var router = express.Router();
const pokemonRouter = require("./pokemon.api.js")

/* GET home page. */

router.use("/pokemons", pokemonRouter);

module.exports = router;
