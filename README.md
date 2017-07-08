# ionic-lazy-loading-migration [![Twitter Follow](https://img.shields.io/twitter/follow/michaelowl_web.svg?style=social&label=Follow&style=flat-square)](https://twitter.com/michaelowl_web)

npm script helping to migrate a Ionic 2+ project to Ionic 3 lazy loading

## Setup

1. Copy the `make-lazy-script` folder to the root of you existing ionic 2+ project.
2. add a script
```
  "scripts": {
    "migrate-to-lazy": "node ./make-lazy-script/migrate-to-lazy-loading.js",
  },
```

## Features

* Create modules for pages in folders named `pages`
** ngx-translate import is included
* Remove unnecessary imports
* Refactor page objects to strings
`nav.setRoot('MyPage')` instead of `nav.setRoot(MyPage)` 
* Create modules for components in folders named `components`

## Customize

The script uses template files with placeholders for generation and replacement. 

E.g. After generating everything I discovered that I needed a custom pipe every page. 
Knowing this before I would have added the import to my `page.module.[ngx-translate].tpl.txt`
  
* component.module.tpl.txt ... Module contents for components
* page.module.ngx-translate.tpl.txt ... Module contents for pages with ngx-translate. Default.
* page.module.tpl.txt ... Module contents for pages with ngx-translate (see arguments)
* ionicpage.tpl.txt ... Adding `@Ionic()` and its import to pages

If you like to use other folders than `pages` and `components` you have to change the variables controlling it.

See https://github.com/git/git/blob/master/make-lazy-script/migrate-to-lazy-loading.js#L15-L16


## Run it

The script runs a simulation by default until you provide a cli argument and start it without simulation.

```
npm run tc:migrate-to-lazy
```


### CLI Arguments

```
npm run tc:migrate-to-lazy <PUT_THE_ARGUMENTS_HERE>
```

* dont-simulate ... Please be careful or use a scm to be able to revert changes :)
* log-contents ... You will see the contents of created and changed files
* exclude-pages ... Excludes generating page modules
* exclude-page-cleanup ... Excludes generating clean up imports and replacing page references with strings
* exclude-components ... Excludes generating custom component modules
* no-ngx-translate ... If you do not want to include the ngx-translate module in every page module

### Manual steps / known issues

After running the script you have to check if everything was done correctly.

In the cleanup step there are a few known issues because my regular expressions are generous. 
So I you are fluent with RegExp and care to improve I gladly accept PRs.

* Functions including the class name will be destroyed. I had functions like `toLoginPage()` resulting in `to'LoginPage'()`
* String page references are quoted as well. So if you have `nav.setRoot('LoginPage')` this will result in `nav.setRoot(''LoginPage'')` 


