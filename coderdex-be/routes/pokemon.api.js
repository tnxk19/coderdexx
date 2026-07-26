const fs = require("fs");
const express = require("express");
const router = express.Router();

/**
 * GET /pokemons
 *
 * Query:
 * page
 * limit
 * search
 * type
 */

router.get("/", (req, res, next) => {
  const allowedFilter = ["search", "type", "page", "limit"];

  try {
    let { page, limit, search, type } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    // Validate query
    Object.keys(req.query).forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const error = new Error(`Query "${key}" is not allowed`);
        error.statusCode = 400;
        throw error;
      }
    });

    // Đọc dữ liệu
    const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));

    let result = db.pokemons;

    // Tìm theo tên
    if (search) {
      const keyword = search.toLowerCase();

      result = result.filter((item) =>
        item.name.toLowerCase().includes(keyword)
      );
    }

    // Lọc theo type
    if (type) {
      const keyword = type.toLowerCase();

      result = result.filter((item) =>
        item.types.some((t) => t.toLowerCase() === keyword)
      );
    }

    const totalPokemons = result.length;
    const totalPages = Math.ceil(totalPokemons / limit);

    // Pagination
    const offset = (page - 1) * limit;
    result = result.slice(offset, offset + limit);

    res.status(200).json({
      pokemons: result,
      currentPage: page,
      totalPages,
      totalPokemons,
    });
  } catch (error) {
    next(error);
  }
});


router.get("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));
    const pokemons = db.pokemons;

    const index = pokemons.findIndex((p) => p.id === id);

    if (index === -1) {
      const error = new Error("Pokemon not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      pokemon: pokemons[index],
      previousPokemon: index > 0 ? pokemons[index - 1] : null,
      nextPokemon:
        index < pokemons.length - 1
          ? pokemons[index + 1]
          : null,
    });
  } catch (error) {
    next(error);
  }
});


const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flying",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

router.post("/", (req, res, next) => {
  try {
    const { id, name, types, evolution = null, url } = req.body;

    // Missing required data
    if (
      id === undefined ||
      !name ||
      !types
    ) {
      const error = new Error("Missing required data.");
      error.statusCode = 400;
      throw error;
    }

    // Types phải là mảng
    if (!Array.isArray(types)) {
      const error = new Error("Types must be an array.");
      error.statusCode = 400;
      throw error;
    }

    // Chỉ được có 1 hoặc 2 type
    if (types.length < 1 || types.length > 2) {
      const error = new Error(
        "Pokémon can only have one or two types."
      );
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra type hợp lệ
    const isValidType = types.every((type) =>
      pokemonTypes.includes(type.toLowerCase())
    );

    if (!isValidType) {
      const error = new Error("Pokémon's type is invalid.");
      error.statusCode = 400;
      throw error;
    }

    // Đọc database
    const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));

    // Kiểm tra trùng id hoặc name
    const existed = db.pokemons.some(
      (pokemon) =>
        pokemon.id === Number(id) ||
        pokemon.name.toLowerCase() === name.toLowerCase()
    );

    if (existed) {
      const error = new Error("The Pokémon already exists.");
      error.statusCode = 409;
      throw error;
    }

    // Tạo Pokémon mới
    const newPokemon = {
      id: Number(id),
      name,
      types,
      evolution,
    };

    // Chỉ thêm url nếu có
    if (url) {
      newPokemon.url = url;
    }

    db.pokemons.push(newPokemon);

    fs.writeFileSync(
      "pokemon.json",
      JSON.stringify(db, null, 2)
    );

    res.status(201).json({
      success: true,
      message: "Pokémon created successfully.",
      pokemon: newPokemon,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, types, evolution, url } = req.body;

    const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));

    const index = db.pokemons.findIndex((pokemon) => pokemon.id === id);

    if (index === -1) {
      const error = new Error("Pokemon not found.");
      error.statusCode = 404;
      throw error;
    }

    // Validate name
    if (!name) {
      const error = new Error("Missing required data.");
      error.statusCode = 400;
      throw error;
    }

    // Validate types
    if (types) {
      if (!Array.isArray(types)) {
        const error = new Error("Types must be an array.");
        error.statusCode = 400;
        throw error;
      }

      if (types.length < 1 || types.length > 2) {
        const error = new Error(
          "Pokémon can only have one or two types."
        );
        error.statusCode = 400;
        throw error;
      }

      const pokemonTypes = [
        "bug",
        "dragon",
        "fairy",
        "fire",
        "ghost",
        "ground",
        "normal",
        "psychic",
        "steel",
        "dark",
        "electric",
        "fighting",
        "flying",
        "grass",
        "ice",
        "poison",
        "rock",
        "water",
      ];

      const isValid = types.every((type) =>
        pokemonTypes.includes(type.toLowerCase())
      );

      if (!isValid) {
        const error = new Error("Pokémon's type is invalid.");
        error.statusCode = 400;
        throw error;
      }
    }

    // Không cho trùng tên với Pokemon khác
    const existed = db.pokemons.some(
      (pokemon) =>
        pokemon.id !== id &&
        pokemon.name.toLowerCase() === name.toLowerCase()
    );

    if (existed) {
      const error = new Error("The Pokémon already exists.");
      error.statusCode = 409;
      throw error;
    }

    db.pokemons[index] = {
      ...db.pokemons[index],
      name,
      types: types ?? db.pokemons[index].types,
      evolution:
        evolution !== undefined
          ? evolution
          : db.pokemons[index].evolution,
      url: url ?? db.pokemons[index].url,
    };

    fs.writeFileSync(
      "pokemon.json",
      JSON.stringify(db, null, 2)
    );

    res.status(200).json({
      success: true,
      message: "Pokémon updated successfully.",
      pokemon: db.pokemons[index],
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));

    const index = db.pokemons.findIndex(
      (pokemon) => pokemon.id === id
    );

    if (index === -1) {
      const error = new Error("Pokemon not found.");
      error.statusCode = 404;
      throw error;
    }

    const deletedPokemon = db.pokemons.splice(index, 1)[0];

    fs.writeFileSync(
      "pokemon.json",
      JSON.stringify(db, null, 2)
    );

    res.status(200).json({
      success: true,
      message: "Pokémon deleted successfully.",
      pokemon: deletedPokemon,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;