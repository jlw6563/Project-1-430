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

const filter = (parsedURL, caughtVal = false) => {
  let response = dataJson

  //If there is no queryParams parsedURL will be undefined
  if (parsedURL) {
    let typeFilter = parsedURL.searchParams.get("type");
    if (typeFilter) {
      response = response.filter((pokemon) => {
        let typeArrayFormatted = pokemon.type.map((type) => type.toLowerCase())
        if (typeArrayFormatted.includes(typeFilter)) return true;
        return false;
      })
    }

    let weaknessFilter = parsedURL.searchParams.get("weakness");
    if (weaknessFilter) {
      response = response.filter((pokemon) => {
        let weaknessArrayFormatted = pokemon.weaknesses.map((weakness) => weakness.toLowerCase())
        if (weaknessArrayFormatted.includes(weaknessFilter)) return true;
        return false;
      })
    }


  }
  if (caughtVal) response = response.filter((pokemon) => pokemon.caught)


  return response;
}

const checkFilter = (array, request, response) => {
  if (array.length === 0) {
    failedResponse(request, response,
      JSON.stringify({ message: "Bad Request Nothing Found", id: "NothingFound" }), 400);
    return true;
  }
  else return false;
}

const displayAllData = (responseArray) => {
  responseArray = responseArray.map((
    { num, name, type, weaknesses, next_evolution, height, weight }) =>
    ({ num, name, type, weaknesses, next_evolution, height, weight }));
  return responseArray;
}

const getPokemonName = (request, response) => {
  let responseArray = dataJson;

  responseArray = responseArray.map(({ name }) => ({ name }));

  responseSucessful(request, response, responseArray);
};

const getPokemonType = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = responseArray.map(({ name, type }) => ({ name, type }));

  responseSucessful(request, response, responseArray);
};

const getAllPokemon = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = displayAllData(responseArray);

  responseSucessful(request, response, responseArray);
};

const getCaughtPokeon = (request, response, parsedURL) => {
  let responseArray = filter(parsedURL, true);

  if (checkFilter(responseArray, request, response)) return;

  responseArray = displayAllData(responseArray);

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
  responseMessage.message = 'Added Pokemon';

  return responseSucessful(request, response, responseMessage, responseCode);
};

const caughtPokeomn = (request, response) => {
  const responseMessage = {
    message: 'Pokemon Not Found',
  };

  const {
    caught,
  } = request.body;

  if (!caught) {
    responseMessage.id = 'PokemonNotFound';
    return failedResponse(request, response, JSON.stringify(responseMessage), 400);
  }

  for (let i = 0; i < dataJson.length; i++) {
    if (dataJson[i].name.toLowerCase().trim() === caught.toLowerCase().trim()) {
      dataJson[i].caught = true;
      responseMessage.message = 'Marked Pokemon Caught';
      return responseSucessful(request, response, JSON.stringify(responseMessage), 204);
    }
  }

  responseMessage.id = 'PokemonNotFound';
  return failedResponse(request, response, JSON.stringify(responseMessage), 400);
};

module.exports = {
  sendPage, failedResponse, getPokemonName, getPokemonType, getAllPokemon, addPokemon, caughtPokeomn, getCaughtPokeon,
};
