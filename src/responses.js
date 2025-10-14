const dataJson = require('../files/pokedex.json');

const sendPage = (request, response, pageData) => {
  response.writeHead(200, { 'Content-Type': pageData.type });
  response.write(pageData.content);
  response.end();
};

const failedResponse = (request, response, content = JSON.stringify({
  message: 'The page you are looking for was not found',
  id: 'notFound',
}), statusCode = 404) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(content, 'utf8') });
  response.write(content);
  response.end();
};

const responseSucessful = (request, response, object, statusCode = 200) => {
  const objectJson = JSON.stringify(object);
  response.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(objectJson, 'utf8') });
  if (request.method !== 'HEAD') {
    response.write(objectJson);
  }
  response.end();
};

const getPokemonName = (request, response) => {
  const responseArray = [];

  dataJson.forEach((pokemon) => {
    responseArray.push(pokemon.name);
  });

  responseSucessful(request, response, responseArray);
};

const getPokemonType = (request, response) => {
  const responseArray = [];

  dataJson.forEach((pokemon) => {
    responseArray.push({ name: pokemon.name, type: pokemon.type });
  });

  responseSucessful(request, response, responseArray);
};

const getAllPokemon = (request, response) => {
  const responseArray = [];
  dataJson.forEach((pokemon) => {
    responseArray.push({
      PokedexNum: pokemon.num, Name: pokemon.name, Type: pokemon.type, Weakness: pokemon.weaknesses, 'Next Evolution': pokemon.next_evolution, Height: pokemon.height, Weight: pokemon.weight,
    });
  });
  responseSucessful(request, response, responseArray);
};

const getCaughtPokeon = (request, response) => {
  const responseArray = [];
  dataJson.forEach((pokemon) => {
    if (pokemon.caught) {
      responseArray.push({
        PokedexNum: pokemon.num, Name: pokemon.name, Type: pokemon.type, Weakness: pokemon.weaknesses, 'Next Evolution': pokemon.next_evolution, Height: pokemon.height, Weight: pokemon.weight,
      });
    }
  });
  responseSucessful(request, response, responseArray);
};

const addPokemon = (request, response) => {
  console.log("Started adding pokemon");
  const responseMessage = {
    message: 'Missing Params',
  };

  const {
    num, name, height, weight,
  } = request.body;

  if (!num || !name || !height || !weight) {
    responseMessage.id = 'missingParams';
    return failedResponse(request, response, JSON.stringify(responseMessage), 400);
  }

  let responseCode = 204;
  if (dataJson[num - 1]) {
    dataJson[num - 1].name = name;
    dataJson[num - 1].height = height;
    dataJson[num - 1].weight = weight;
    responseMessage.message = 'Updated Pokemon';
    return responseSucessful(request, response, responseMessage, responseCode);
  }
  responseCode = 201;
  const ID = parseInt(num, 10);
  dataJson.push({
    id: ID,
    num,
    name,
    img: '',
    type: [
    ],
    height,
    weight,
    weaknesses: [
    ],
  });
  responseMessage.message = "Added Pokemon"

  responseSucessful(request, response, responseMessage, responseCode);

};

const caughtPokeomn = (request, response) => {
  const responseMessage = {
    message: 'Pokemon Not Found',
  };

  const {
    caught,
  } = request.body;
  console.log(request.body);
  console.log(caught);
  if (!caught) {
    responseMessage.id = 'PokemonNotFound';
    failedResponse(request, response, JSON.stringify(responseMessage), 400);
    return;
  }

  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].name.toLowerCase().trim() === caught.toLowerCase().trim()) {
      dataJson[i].caught = true;
      responseMessage.message = 'Marked Pokemon Caught';
      responseSucessful(request, response, JSON.stringify(responseMessage), 204);
      return;
    }
  }
};

module.exports = {
  sendPage, failedResponse, getPokemonName, getPokemonType, getAllPokemon, addPokemon, caughtPokeomn, getCaughtPokeon,
};
