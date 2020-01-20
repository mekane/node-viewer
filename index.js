const fs = require('fs');
const open = require('open');

const port = 6969;

const directory = getDirectory();
console.log(`starting up in ${directory}`);

const files = fs.readdirSync(directory);

console.log('Buliding list of files');
files.forEach((f, i) => {
    console.log(`  ${i}: ${f}`);
});

const maxPage = files.length - 1;

startServer();

open(`http://localhost:${port}/`, { app: ['chromium-browser', '--incognito', '--appgi', '--start-fullscreen'] });

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

    if (isNaN(page) || page < 0 || page > maxPage) {
        res.status(400);
        res.send(`Invalid page number ${page}`);
        return;
    }

    const z = req.query['z'];
    let zoom;
    if (z === 'h')
        zoom = 'h';
    else if (z === 'w')
        zoom = 'w';

    res.send(getPage(page, zoom));
}

function getPage(page, zoom) {
    return pageHead(page) + pageBody(page, zoom) + pageEnd(page);
}

function pageHead(page) {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page ${page}</title>
  <style>
  body {
    margin: 0;
    padding: 0;
  }

  h1 {
    color: #aaa;
    position: absolute;
    top: 24px;
  }

  a.link {
    color: #ccc;
    font-weight: bold;
    position: absolute;
    top: 4px;
  }
  
  img.fit-height {
    height: 100vh;
  }
  
  img.fit-width {
    width: 100vw;
  }
</style>
</head>`;
}

function pageBody(page, zoom) {
    const image = files[page];

    let prev = '';
    let next = '';
    let params = '';
    let imageClass = '';

    if (zoom) {
        params = `?z=${zoom}`;

        if (zoom === 'h')
            imageClass = 'fit-height';
        else if (zoom === 'w')
            imageClass = 'fit-width';
    }

    if (page > 0) {
        prev = `<a id="prev" class="link" style="left: 4px;" href="/${page - 1}${params}">Prev</a>`;
    }

    if (page < maxPage) {
        next = `<a id="next" class="link" style="right: 4px;" href="/${page + 1}${params}">Next</a>`;
    }

    return `<body style="background: rgb(44, 44, 44)">
${prev}
  <h1>Page ${page}</h1>
${next}
  <a id="imageLink" href="/${page < maxPage ? page + 1 : 0}${params}">
    <img id="image" class="${imageClass}" style="display: block; margin: auto;" src="/${image}">
  </a>
  <script>
  document.body.addEventListener('keyup', onkeypress);

  const img = document.getElementById('image');
  const next = document.getElementById('next');
  const prev = document.getElementById('prev');
  
  function onkeypress(e) {
    if (e.key === 'ArrowRight') {
        next.click();
    }
    
    if (e.key === 'ArrowLeft' && prev) {
        prev.click();
    }

    if (e.key === '1') {
        zoomHeight();
    }
    
    if (e.key === '2') {
        zoomDefault();
    }

    if (e.key === '3') {
        zoomWidth();
    }

    if (e.key === 'z') {
        toggleZoom();
    }
  }
  
  function zoomHeight() {
      img.className = 'fit-height';
      setZoomParam('h');
  }
  
  function zoomDefault() {
      img.className = '';      
      setZoomParam();
  }
  
  function zoomWidth() {
      img.className = 'fit-width';
      setZoomParam('w');
  }
  
  function toggleZoom() {
      if ( img.className === '' )
          zoomWidth();
      else if (img.className === 'fit-width')
          zoomHeight();
      else
          zoomDefault();
  }

  const linkIds = ['imageLink', 'next', 'prev'];

  function setZoomParam(newVal) {
      if ( newVal === 'h' || newVal === 'w') {
        linkIds.forEach(linkId => {
            const link = document.getElementById(linkId);
            if ( link.href.includes('?z=')) {
                link.href = link.href.slice(0, link.href.lastIndexOf('?')) + '?z=' + newVal; 
            }
            else
                link.href += '?z='+newVal;
        });
      }
      else {
          linkIds.forEach(linkId => {
              const link = document.getElementById(linkId);
              link.href = link.href.slice(0, link.href.lastIndexOf('?'));
          });
      }
  }
  </script>
</body>
`;
}

function pageEnd(page) {
    return `</html>`;
}
