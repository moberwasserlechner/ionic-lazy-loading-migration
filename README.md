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
  * ngx-translate import is included by default
* Remove unnecessary imports
* Refactor page objects to strings
`nav.setRoot('MyPage')` instead of `nav.setRoot(MyPage)` 
* Create modules for components in folders named `components`
* `pages` and `components` are recusively searched so your project layout can be folder-per-feature as well

## Customize

The script uses template files with placeholders for generation and replacement. 

There are situations when you want to change them according to your needs. E.g. After generating everything I discovered that I needed a custom pipe in every page. 
Knowing this before I would have added the import to my `page.module.[ngx-translate].tpl.txt`
  
* component.module.tpl.txt ... Module contents for components
* page.module.ngx-translate.tpl.txt ... Module contents for pages with ngx-translate. Default.
* page.module.tpl.txt ... Module contents for pages with ngx-translate (see arguments)
* ionicpage.tpl.txt ... Adding `@Ionic()` and its import to pages

If you like to use other folders than `pages` and `components` you have to change the variables controlling it.

See https://github.com/moberwasserlechner/ionic-lazy-loading-migration/blob/master/make-lazy-script/migrate-to-lazy-loading.js#L15-L16

## Known issues

In the cleanup step there are a few known issues because my regular expressions are not good enough. So if you are fluent with RegExp and care to improve I gladly accept PRs.

I did some improvements lately but this might happen nevertheless
* Functions including the class name. I had functions like `toLoginPage()` resulting in `to'LoginPage'()`
* String page references might be double quoted. So if you have `nav.setRoot('LoginPage')` this will result in `nav.setRoot(''LoginPage'')`

## Run it

The script runs a simulation by default until you provide a cli argument and start it without simulation.

```
npm run migrate-to-lazy
```


### CLI Arguments

```
npm run migrate-to-lazy <PUT_THE_ARGUMENTS_HERE>
```

* dont-simulate ... Please be **careful** and use a **scm** to be able to **revert changes**!
* log-contents ... You will see the contents of created and changed files
* exclude-pages ... Excludes generating page modules
* exclude-page-cleanup ... Excludes generating clean up imports and replacing page references with strings
* exclude-components ... Excludes generating custom component modules
* no-ngx-translate ... If you do not want to include the ngx-translate module in every page module

### Manual steps

After running the script you have to do at least this manual steps.

* Upgrade to Ionic 3 if you didn't do so already!
* Go to `app.module.ts` and remove the pages and components. File will be broken after script run.
* Import needed modules in your **page** module and **component** module files. 
Easiest way is to run `ionic serve` open javascript console and wait for errors.
* I had problems using Ionic's build in subcribe-publish [Events](https://ionicframework.com/docs/api/util/Events/). 
Most issues are fixed as soon as I added it to the list of providers in my `app.component.ts`. But in Popovers it's still not working. I will ask that on the forum.

### Links

A few links which helped me upgrading.

* Before starting I asked [this question](https://forum.ionicframework.com/t/start-an-app-with-lazy-loading/96780)
* [ngx-translate](https://forum.ionicframework.com/t/ngx-translate-and-ionic-3/87005/24)
* Ionic Blog [part 1](http://blog.ionic.io/ionic-and-lazy-loading-pt-1/) and [part 2](http://blog.ionic.io/ionic-and-lazy-loading-pt-2/)
* https://ionicacademy.com/ionic-3-lazy-loading/
