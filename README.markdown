# jeo
A trait based dependency injection library.

## Goals
TODO

## Installation
This library aims to be completely platform agnostic so it should be possible
to use it in any javascript environment. 
* node/io.js/NativeScript/React Native

```html
var jeo = require('path/to/jeo');
var t = jeo({ ... });
```

* with AMD compatible loaders like requirejs/dojo1.7+ or basically anything that
  exposes a global `define` function with `define.amd` defined 

```html
define(['path/to/jeo'], function (jeo) {
    return jeo({ ... });
});
```

* in any browser environment

```html
<script src="path/to/jeo"></script>
<script>
var t = jeo({ ... });
</script>
```

## Usage
TODO

For more usage examples you can browse the jasmine specs inside the specs directory.

## Contributing
If you encounter bugs and/or an environment where the library falls apart I appreciate 
your input. Though I'm not currently planning on accepting pull requests in this early
stage (until say, v0.5.0) please feel free to open an issue for any idea you might have
on [github](https://github.com/mfeineis/jeo/issues). I'd like hearing your opinion!

## History
* v0.2.0 Included dependency injection container configuration
* v0.1.0 Basic trait handling
