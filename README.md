### Supporting code for:

# Building HTM Systems

[![Build Status](https://travis-ci.org/htm-community/building-htm-systems.svg?branch=master)](https://travis-ci.org/htm-community/building-htm-systems)

This is the JavaScript source code for [buildinghtm.systems](http://buildinghtm.systems).

## HTM Reference Implementation

The HTM system running these visualization is called [simplehtm](https://github.com/htm-community/simplehtm).

## Running

    npm run dev

* * *

# ❗️WARNING❗️

THIS REPO IS ABOUT TO BE RE-HAULED LIVE ON TWITCH, TUNE TO https://www.twitch.tv/rhyolight_ THURSDAYS 9AM PDT.

DON'T TRUST ANY OF THIS STUFF BELOW, IT WON'T WORK FOR LONG...

The plan is [taking shape here](https://trello.com/b/iOG0iEnT/building-htm-systems).

* * *


## Widgets

These are used in the website as interactive examples. They are separated by URL/folder. Each folder has one page of
widgets, so they get built / tested in a page environment the same way they will be displayed.

Widget binaries are constructed by webpack and chucked into URL/folder. Their source code is in `src/widgets`

### Building Widgets:

Widgets are bundled for deployment as a page. A page can have many widgets that interact with each other. They are built and tested with this in mind. Webpack is used to build bundles for specific targets. To build all webpack targets:

    npm start

### Wordpress Deployment

Webpack is currently configured to deploy to the `wp-content` folder with the same tree structure expected by Wordpress. This makes it easy to create compiled JS files and upload them to Wordpress for embedding into various pages.

## Demo / Test

See [widgets.html](./widgets.html) for examples.

## JSDS

If you are poking around inside the widgets you will probably notice something called [JSDS](https://github.com/rhyolight/JavaScript-Data-Store) being used as a data store. This a small observable data cache written almost a decade ago that demonstrates many of the desired attributes of reactive programming. Basically, each data store is observable, so for each widget we create one and load it with data. Then the visualization code simple observes the JSDS instance for changes to data and renders appropriately. This allows for granular UI updates and prevents unecessary repaints.

#### JSDS for inter-widget communication

Deployment targets for this project are pages, which can contain many widgets. These widgets may be data-dependent on each other. At the page level, we can create widgets that update as dependent widgets update by using the observable nature of JSDS. Just have one widget observe a value of a previous widget's data store and it can update in response.

#### JSDS for HTML interaction

JSDS also allows access at the global page level so we can program specific interactions to occur as the user interacts with an HTML page.
