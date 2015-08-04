## chrome-storage

Get/store values via the Chrome Storage API.

This repository is also meant as an example how to develop Polymer elements for Chrome Apps,
with testing work flows. (Link to blog post pending)

### Dependencies

With Node.js installed, run the following one liner from the root of this project to install all dependencies:

```sh
npm install -g gulp bower && npm install && bower install
```

### Development workflows

#### Test

```sh
gulp build:test
```

This will build a Chrome App based on the tests in the `test` folder into `test-app` which can be loaded
as "Unpacked Extension" in Chrome to run the tests with the Chrome Apps APIs available.

```sh
gulp live:test
```

This will build the same Chrome App but with live reloading enabled.

#### Demo

```sh
gulp build:demo
```

This will build a Chrome App based on the `demo` folder into `demo-app` which can be loaded
as "Unpacked Extension" in Chrome to show your element in acation

```sh
gulp live:demo
```

This will build the same Chrome App but with live reloading enabled.
