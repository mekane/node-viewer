const fs = require('fs');
//const path = require('path');

const directory = getDirectory();
console.log(`starting up in ${directory}`);

const files = fs.readdirSync(directory);

console.log('Buliding list of files');
files.forEach((f,i) => {
  console.log(`  ${i}: ${f}`);
});

startServer();


function getDirectory() {
  const cwd = process.cwd();
  const arg1 = process.argv[2];

  let dir = cwd;

  if (arg1)
    dir += `/${arg1}`;

  return dir;
}

function startServer() {
  const express = require('express');
  const port = 6969;
  const app = express();
  app.use(express.static(directory));
  app.get('/', startAtPageZero);
  app.get('/:p', showPage);
  app.listen(port, () => console.log(`Server listening on port ${port}!`));

  /*
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

  app.use(express.static('public', options))
  */
}

function startAtPageZero(req, res) {
  res.redirect(301, '/0');
}

function showPage(req, res) {
  console.log(`page requested`, req.params);
  const p = req.params['p'];

  //validate page
  const page = parseInt(p, 10);

  if ( isNaN(page) || page < 0 || page >= files.length ) {
    res.status(400);
    res.send(`Invalid page number ${page}`);
    return;
  }

  res.send(getPage(page));
}

function getPage(p) {
  return pageHead(p) + pageBody(p) + pageEnd(p);
}

function pageHead(page) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page ${page}</title>
</head>`
;
}

function pageBody(page) {
  const image = files[page];

  return `<body>
  <h1>Page ${page}</h1>
  <a href="/${image}">
    <img src="/${image}">
  </a>
</body>
`;
}

function pageEnd(page) {
  return `</html>`;
}

