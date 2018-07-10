# Zerobin GCP: Website

This is the basics of the web interface:

```
index.html (basic HTML wrapper)
index.js (core app functionality)
msg_write.js (create key, encrypt message)
msg_read.js (decrypt message)
ui.js (basic UI code)
```

## Development Instructions

Install all node modules, and start a local dev server w/ default settings:

```sh
npm i
npm start
```

Then open your browser:

```
open "http://localhost:8080"
```

See `package.json` and other configuration details.

## Dev Dependencies

- [babel-core](https://github.com/babel/babel/tree/master/packages): Babel compiler core.
- [babel-plugin-transform-async-to-generator](https://github.com/babel/babel/tree/master/packages): Turn async functions into ES2015 generators
- [babel-plugin-transform-runtime](https://github.com/babel/babel/tree/master/packages): Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals
- [babel-preset-env](https://github.com/babel/babel-preset-env): A Babel preset for each environment.
- [babelify](https://github.com/babel/babelify): Babel browserify transform
- [browserify](https://github.com/browserify/browserify): browser-side require() the node way
- [beefy](http://didact.us/beefy/): A local development server
- [eslint](https://github.com/eslint/eslint): A linter

## License

MIT
