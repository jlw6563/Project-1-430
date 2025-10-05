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
  const responseMessage = {
    message: 'Missing Params',
  };

  const {
    num, name, height, weight,
  } = request.body;

  if (!num || !name || !height || !weight) {
    responseMessage.id = 'missingParams';
    failedResponse(request, response, responseMessage, 400);
    return;
  }

  let responseCode = 204;

  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].num === num) {
      responseCode = 201;
      dataJson[i].name = name;
      dataJson[i].height = height;
      dataJson[i].weight = weight;
      responseMessage.message = 'Updated Pokemon';
      responseSucessful(request, response, responseMessage, responseCode);
      return;
    }

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

    responseSucessful(request, response, responseMessage, responseCode);
  }
};

const caughtPokeomn = (request, response) => {
  const responseMessage = {
    message: 'Pokemon Not Found',
  };

  const {
    name,
  } = request.body;

  if (!name) {
    responseMessage.id = 'PokemonNotFound';
    failedResponse(request, response, responseMessage, 400);
    return;
  }

  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].name === name) {
      dataJson[i].caught = true;
      responseMessage.message = 'Updated Pokemon';
      responseSucessful(request, response, responseMessage, 201);
      return;
    }
  }
};

module.exports = {
  sendPage, failedResponse, getPokemonName, getPokemonType, getAllPokemon, addPokemon, caughtPokeomn, getCaughtPokeon,
};
