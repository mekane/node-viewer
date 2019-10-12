# File Viewer

The goal of this project is to make it very easy to browse a directory of image files, providing a few conveniences but
not getting in the way. It works by starting a very lightweight Node server in a local directory and making it available
in the browser, with each image available via a path. It is well suited to reading comic books, etc. where each physical
page is one images. 

## Setup

   * run `npm install`
   * run the script (index.js) in a directory to start the server in that directory, indexing all the files present.
   * Note: include the following in your $PATH as a script to make it easier to start in a directory:
   
```
#! /bin/bash
node <replace/with/path/to/git/checkout/index.js $@
```

## Usage

Run the script in a directory to index the files in that directory and serve them. If you provide an argument, that path
will be added to the current directory to specify the directory to be indexed and served.

The script will try to open `chromium-browser` in incognito mode at the first page.

Click the current image or hit right arrow to go to the next page. Hit left arrow to go back.
