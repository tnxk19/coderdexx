const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const results = [];
let id = 1;

const imageFolder = "./images";
const imageFiles = fs.readdirSync(imageFolder);

const imageMap = new Map();

imageFiles.forEach((file) => {
  imageMap.set(path.parse(file).name.toLowerCase(), file);
});

fs.createReadStream("pokemon.csv")
  .pipe(csv())
  .on("data", (row) => {
    const image = imageMap.get(row.Name.toLowerCase());

    const types = [row.Type1, row.Type2].filter(
      (type) => type && type.trim() !== ""
    );

    results.push({
      id: id++,
      name: row.Name,
      types,
      evolution: row.Evolution || null,
      url: image
  ? `http://localhost:8000/images/${image}`
  : null,
    });
  })
  .on("end", () => {
    fs.writeFileSync(
  "pokemon.json",
  JSON.stringify(
    {
      pokemons: results,
    },
    null,
    2
  )
);

    console.log("Đã tạo pokemon.json");
  });