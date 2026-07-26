const fs = require("fs");
const { faker } = require("@faker-js/faker");

const db = JSON.parse(fs.readFileSync("pokemon.json", "utf8"));

const categories = [
  "Seed",
  "Lizard",
  "Flame",
  "Mouse",
  "Bird",
  "Dragon",
  "Snake",
  "Fish",
];

const abilities = [
  "Overgrow",
  "Blaze",
  "Torrent",
  "Chlorophyll",
  "Solar Power",
  "Swift Swim",
  "Intimidate",
  "Levitate",
  "Static",
  "Pressure",
];

db.pokemons = db.pokemons.map((pokemon) => ({
  ...pokemon,
  description: faker.lorem.sentence(),
  height: `${faker.number.float({
    min: 0.3,
    max: 3,
    fractionDigits: 1,
  })} m`,
  weight: `${faker.number.float({
    min: 2,
    max: 300,
    fractionDigits: 1,
  })} kg`,
  category: faker.helpers.arrayElement(categories),
  abilities: faker.helpers.arrayElements(abilities, {
    min: 1,
    max: 2,
  }),
}));

fs.writeFileSync("pokemon.json", JSON.stringify(db, null, 2));

console.log("Done!");