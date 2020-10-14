# js-localised 
## About this folder 
```
desktop
   /js               This folder should be igoned, it's populted by the build process
   /js-dist          This folder contains all the Starter-kit javascript files
   /js-localised     This forder contains your local versions  
```

### Customising existing files 
The `js-localised` folder contains any javascript files local to the project. 
For example, if you wish to overwrite the default `components/accordion.js` supplied by starter-kit, copy the file (with the folder structure) from the `js-dist` folder to the `js-localised` folder. 
So you should have `./desktop/js-localised/components/accordion.js` you can now edit this file.

### Adding new JS files to the theme
When there is a need to add a new file to the client library, add it to the `js-localised` folder e.g. `./desktop/js-localised/components/foo-bar.js` 
Open the `desktop/js-localised/js.txt` (if it doesn't exist, create it and restart gulp dev/server), this js.txt should be empty except for the relative path to the new file e.g.
```
components/foo-bar.js
```
Both the new file and the js.txt will get copied over to the js folder where they will be included in the client library 

NB: new js files don't get automatically added to the HTML in CE, after adding a new js file you will either need to manually edit the HTML source code or upload the CE package and re-export it.

## CE development gulp tasks
Run one of the gulp commands
 
```
$ gulp dev          # this will watch for changes to your sass and js-localised folders and will update the css/js folders
$ gulp server       # this starts the local CE server and runs gulp dev, best gulp task for local development 
```

To rebuild the project without watching for file changes run 
```
$ gulp build        # this builds the CSS, JS and performs linting tasks 
``` 
 
## Custom head.js
If you require a custom head.js create a 'head' folder here and add javascript files to the folder.
Do not create a file named `head.js` as this file will get automatically generated from all the files contained in the 'head' folder.

