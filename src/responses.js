const dataJson = require("../files/pokedex.json");

console.log(dataJson);

const sendPage = (request,response, pageData) => {
    response.writeHead(200, {"Content-Type" : pageData.type});
    response.write(pageData.content);
    response.end();
}

const notFound = (request,response) => {
    const content = JSON.stringify({
        message: 'The page you are looking for was not found',
        id: 'notFound',
    });

    response.writeHead(404, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(content, 'utf8') });
    response.write(content);
    response.end();
};


module.exports = { sendPage, notFound };