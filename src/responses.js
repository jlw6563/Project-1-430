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


const getPokemonName = (request, response) => {
    let responseArray = [];

    dataJson.forEach(pokemon => {
        responseArray.push(pokemon.name);
    })

    responseArray = JSON.stringify(responseArray);

    response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(responseArray, 'utf8') })
    if (request.method !== "HEAD") {
        response.write(responseArray);
    }
    response.end();

}

module.exports = { sendPage, notFound, getPokemonName };