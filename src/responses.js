const dataJson = require("../files/pokedex.json");



const sendPage = (request, response, pageData) => {
    response.writeHead(200, { "Content-Type": pageData.type });
    response.write(pageData.content);
    response.end();
}

const notFound = (request, response) => {
    const content = JSON.stringify({
        message: 'The page you are looking for was not found',
        id: 'notFound',
    });

    response.writeHead(404, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(content, 'utf8') });
    response.write(content);
    response.end();
};

const respond = (request, response, responseArray) => {
    responseArray = JSON.stringify(responseArray);

    response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(responseArray, 'utf8') })
    if (request.method !== "HEAD") {
        response.write(responseArray);
    }
    response.end();
}


const getPokemonName = (request, response) => {
    let responseArray = [];

    dataJson.forEach(pokemon => {
        responseArray.push(pokemon.name);
    })

    respond(request, response, responseArray);
}

const getPokemonType = (request, response) => {
    let responseArray = [];

    dataJson.forEach(pokemon => {
        responseArray.push({ "name": pokemon.name, "type": pokemon.type });
    })

    respond(request, response, responseArray);

}

const getAllPokemon = (request, response) => {
    let responseArray = [];
    dataJson.forEach(pokemon => {
        responseArray.push({ "PokedexNum": pokemon.num, "Name": pokemon.name, "Type": pokemon.type, "Weakness": pokemon.weaknesses, "Next Evolution": pokemon.next_evolution, "Height": pokemon.height, "Weight": pokemon.weight })
    })
    respond(request, response, responseArray);
}

module.exports = { sendPage, notFound, getPokemonName, getPokemonType, getAllPokemon };