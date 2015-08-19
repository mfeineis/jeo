# jeo
THIS IS ONLY A PLAYGROUND PET PROJECT - NO ROADMAP AS OF YET

## Puns
* Traits with a shot
* Stateful traits on steroids
* *more to come*


## Design Goals
* Provide a solid [stateful traits][] implementation for JavaScript
* Provide easy to use dependency injection to enable testing and isolation
* Practive behavior driven development from day one
* Guide the user to the pit of success by making *doing the right thing* easy.
* Use [semantic versioning](http://semver.org)
* Be minimal - we don't want another *insert bloated framework here*
* Be platform agnostic - run anywhere
* Play nice with others 
    + Don't pollute the global namespace
    + Don't add another 10 lines to the [UMD][] format


## Usage
```javascript
let { trait } = require('jeo');

let engine = trait({
    public: {
        start() { }
        stop() { }
    }
});

let chassis = trait({
    public: {
        steerLeft() { },
        steerLight() { }
    }
});

let vehicle = trait({
    is: [chassis, engine.resolve({ 
        start: 'startEngine', 
        stop: 'stopEngine' 
    })],
    public: {
        accelerate: trait.required,
        startEngine: trait.required,
        stopEngine: trait.required
    }
});

let car = trait({
    is: [vehicle],
    public: {
        accelerate(milesPerHour) { }
    }
});

let fluxCapacitor = trait({
    public: {
        engage() { }
    }
});

let timeMachine = trait({
    is: [nuclearPowerSource, fluxCapacitor.resolve({
        engage: 'engageFluxCapacitor' 
    })],
    public: {
        engage() { },
        setDestination() { }
    }
});

let nuclearPowerSource = trait({
    public: {
        charge(watts) { }
    }
});

let hoverPadChassis = trait({
    public: {
        steerDown: { },
        steerLeft: { },
        steerRight: { },
        steerUp: { }
    }
});

let mrFusion = trait({
    public: {
        charge(watts) { }
    }
});

let delorean = trait(car, timeMachine.resolve({ engage: 'engageTimeMachine' });

let flyingDeloreanFromTheFuture = delorean.create({
    for: [
        { trait: nuclearPowerSource, use: mrFusion },
        { trait: chassis, use: hoverPadChassis }
    ]
});

flyingDeloreanFromTheFuture.startEngine();
flyingDeloreanFromTheFuture.setDestination();
flyingDeloreanFromTheFuture.charge(1.21e9);
flyingDeloreanFromTheFuture.accelerate(88);
flyingDeloreanFromTheFuture.engageFluxCapacitor();
flyingDeloreanFromTheFuture.engageTimeMachine();

```

For more usage examples you can browse the jasmine specs inside the specs directory.


## About the library
*TL/DR* This library is my little sandbox for exploring stateful traits with baked
in dependency injection as a viable alternative to other means of achieving coding zen.

### Introduction
The basic premise of the library has been incubating for some time now. There is
a whole cemetary of zombie library approaches that precede this release. Ranging 
from my early beginnings learning the language I scratched the complexity of 
implementing an asynchronous script loader that taught me how [requirejs][] and 
[YUI3][] did their magic. I also took a close look at [jQuery][], [dojo][], [base2][], 
[Knockout][], [Angular][], [ExtJS][] and countless other libraries and _of course!_ 
worked on several hybrids trying to *unify them all* (tm).

Virtually all of these libraries include a way to mimic some sort of class system that
served to make JavaScript more *insert your favorite language here*y and I've ever since
been amazed at how versatile JS is to support all these crazy use cases - just look at
what the *import/export* idiom in [base2][] by [Dean Edwards][] library looks like or 
how the class creation plugin architecture in [ExtJS][] works.

### Come to the point
One day I stumbled across the [traitsjs][] library that immediately caught my attention.
At the time I didn't really know what to make of these *traits* and the source code seemed 
like voodoo magic - `Object.defineProperty(omg, 'what', { value: 'the hell' })` to me but
still I was hooked. I reimplemented most of the functionality to get the hang out of it
but the code was truely aweful and my interest didn't last too long after that experiment.
Nevertheless this library remains a huge influence on my thinking of object composition.

In my day to day work I've come to appreciate the [SOLID][] principles quite a bit. In my
experience they really push you to a better design that is far more maintainable than 
anything I produced beforehand. The thing is that it's hard to achieve Nerdvana without
proper guidance. I can't count the hours I read up on software architecture and trying
to reimplement the core elements of the libraries that stuck with me. Still there is 
always this nagging feeling inside that there has to be a way to do better - the everlasting
urge to *rewrite the whole system from scratch*. 

That being said I tried a whole lot of angles on the architecture/code organization side 
and I strongly feel that classes are not my best bet. This is amplified by the final advent
of ES6 and language level support for JavaScript classes and my exposition to them by
using TypeScript's implementation for quite some time. It sure feels familiar and you can
be productive and there is no need to lock yourself in to a specific framework. I am
aware that this is the explicit design goal of ES6 classes but for me all the exciting
stuff I love about the language will soon vanish from most libraries and frameworks. For
me JavaScript is about experimentation and testing the boundaries.

So I have decided to stay away from ES6 classes - at least in my spare time - and have
some fun with the language and we will see where the ride with traits takes me.


## Acknowledgements
A list of libraries and other sources that helped me learning a brilliant yet inherently 
broken language by providing their source code and knowledge out in the open for everyone 
to gaze upon:

### A
[Angular]:              http://angularjs.org

### B
[babel]:                https://babeljs.io/]
[base2]:                http://dean.edwards.name/weblog/2007/12/base2-intro/

### C
[Douglas Crockford]:    http://www.crockford.com

### D
[DailyJS]:              http://www.dailyjs.org
[Dean Edwards]:         http://dean.edwards.name/
[dojo]:                 http://dojotoolkit.org
[DotNetJunkie]:         https://cuttingedge.it/blogs/steven/pivot/entry.php?id=92

### E
[ExtJS]:                http://www.sencha.com/products/extjs/

### F
[FuseJS]:               https://github.com/paulirish/fusejs

### H
[Html5Weekly]:          html5weekly.com

### J
[jasmine]:              http://jasmine.github.io
[JavaScriptWeekly]:     http://javascriptweekly.com
[John Resig]:           http://ejohn.org
[jQuery]:               http://www.jquery.com

### K
[Knockout]:             http://www.knockoutjs.com

### R
[requirejs]:            http://requirejs.org

### S
[SOLID]:                http://en.wikipedia.org/wiki/SOLID_%28object-oriented_design%29
[StatefulTraits]:       http://scg.unibe.ch/archive/papers/Berg07aStatefulTraits.pdf

### T
[traitsjs]:             http://soft.vub.ac.be/~tvcutsem/traitsjs/

### U
[UMD]:                  https://github.com/umdjs/umd

### Y
[YUI3]:                 http://yuilibrary.com


## Fun With Facts
* The library itself and the [jasmine][] BDD spec is written in idiomatic 
  ES6 that is being transpiled to ES5 using [babel][]. 
* All code has been written in [VIM](http://www.vim.org).
* The library has it's name from me working at some project for the geo science
  department of my former university and feeling really clever about coming
  up with a short name for the home brew library being developed.


## Building
To build a version just clone the repo, run `npm install` to fetch the dependencies 
and then run `gulp`. This will run the test suite and put a built version into the 
`dist/latest` and `dist/{version}` directory where the version is taken from the 
`package.json`. You need to have nodejs (v0.10.0+) or a recent version of io.js 
installed to build.

```
git clone https://github.com/mfeineis/jeo.git
npm install
gulp
```

To run the test suite run
```
gulp tests
```

## Installation
This library aims to be completely platform agnostic so it should be possible to use 
it in any JavaScript environment that support ES3 - that even includes ancient browsers 
nobody cares to support anymore. Just grab the `dist/latest/jeo.js` and have fun.

* node/io.js/NativeScript/React Native

```javascript
var jeo = require('path/to/jeo');
var t = jeo.trait({ ... });
```

* with AMD compatible loaders like requirejs/dojo1.7+ or basically anything that
  exposes a global `define` function with `define.amd` defined 

```javascript
define(['path/to/jeo'], function (jeo) {
    return jeo.trait({ ... });
});
```

* in any browser environment

```html
<script src="path/to/jeo"></script>
<script>
var t = jeo.trait({ ... });
</script>
```

## Contributing
If you encounter bugs and/or an environment where the library falls apart I appreciate 
your input. Though I'm not currently planning on accepting pull requests in this early
stage (until say, v0.5.0) please feel free to open an issue for any idea you might have
on [github](https://github.com/mfeineis/jeo/issues). I'd love to here from you!

## change Log
* v0.2.1 Supports resolving public members while retaining the original name in the private execution context
* v0.2.0 Dependency Injection working
* v0.1.0 Basic trait handling and instance construction

## TODO
* Implement decorators
* Eat my own dogfood to improve the API
* Write *good* examples
