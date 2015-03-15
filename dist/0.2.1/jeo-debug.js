"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

/*! jeo v0.2.1 (c) 2015 Martin Feineis, MIT license (https://www.github.com/mfeineis/jeo) */
/*jshint esnext:true, maxlen:80 */
/*global define,module */
(function (global, name, factory) {
    "use strict";

    if (typeof define !== "undefined" && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module !== "undefined") {
        // CommonJS
        module.exports = factory();
    } else {
        // No modules
        global[name] = factory();
    }
})((0, eval)("this"), "jeo", function () {
    "use strict";

    var Object_create = Object.create;
    var Object_freeze = Object.freeze;
    var Object_keys = Object.keys;
    var hasOwnProperty = ({}).hasOwnProperty;

    function mix(to) {
        var from = arguments[1] === undefined ? {} : arguments[1];

        Object_keys(from).forEach(function (key) {
            to[key] = from[key];
        });

        return to;
    }

    function assert(condition) {
        var message = arguments[1] === undefined ? "An assertion failed." : arguments[1];

        if (!condition) {
            throw new Error(message);
        }
    }

    // Used to check preconditions
    function requires(condition) {
        var message = arguments[1] === undefined ? "A precondition has been violated." : arguments[1];

        if (!condition) {
            throw new Error(message);
        }
    }
    requires.not = {};

    var requiresExtensions = {
        toBeDefined: function toBeDefined(object) {
            return typeof object !== "undefined";
        },
        toBeNull: function toBeNull(object) {
            return object === null;
        }
    };

    // Putting the extensions and their inverses onto the
    // requires function
    Object_keys(requiresExtensions).forEach(function (key) {

        requires[key] = (function (extension) {
            return function (thingy, message) {
                var ok = extension.apply(undefined, arguments);
                requires(ok, message);
            };
        })(requiresExtensions[key]);

        requires.not[key] = (function (extension) {
            return function (thingy, message) {
                var ok = !extension.apply(undefined, arguments);
                requires(ok, message);
            };
        })(requiresExtensions[key]);
    });

    function extractDependencies(descriptor) {
        requires.toBeDefined(descriptor, "No descriptor specified.");
        requires.not.toBeNull(descriptor, "A descriptor can not be null.");

        var constructor = hasOwnProperty.call(descriptor, "constructor") ? descriptor.constructor : function () {};
        var constructorArgumentCount = constructor.length;

        if (typeof constructor !== "function") {
            throw new Error("\"constructor\" must be a function.");
        }

        var hasRequires = hasOwnProperty.call(descriptor, "requires");
        var requiresSetting = hasRequires ? Array.isArray(descriptor.requires) ? descriptor.requires : [descriptor.requires] : [];
        var dependencyCount = requiresSetting.length;

        if (constructorArgumentCount === 0 && dependencyCount > 0) {
            throw new Error("\"requires\" is not allowed to provide " + "dependencies when the constructor doesn't require any");
        }

        if (constructorArgumentCount !== dependencyCount) {
            throw new Error("\"requires\" has to provide the same amount of " + "dependencies that the constructor declares (" + JSON.stringify(descriptor) + ")");
        }

        requiresSetting.forEach(function (dependency) {
            if (!isTrait(dependency)) {
                throw new Error("\"" + JSON.stringify(dependency) + "\" is not " + "a valid trait");
            }
        });

        return {
            constructor: constructor,
            requires: requiresSetting
        };
    }

    function extractTraits(descriptor) {
        var hasTraits = hasOwnProperty.call(descriptor, "is");
        var traits = hasTraits ? Array.isArray(descriptor.is) ? descriptor.is : [descriptor.is] : [];

        traits.forEach(function (t) {
            if (!isTrait(t)) {
                throw new Error("\"" + JSON.stringify(t) + "\" is not " + "a valid trait");
            }
        });

        return {
            traits: traits
        };
    }

    function extractMain(descriptor) {
        var hasMain = hasOwnProperty.call(descriptor, "main");
        var main = hasMain ? descriptor.main : function () {};

        if (typeof main !== "function") {
            throw new Error("\"main\", if provided has to be a function.");
        }

        return {
            main: main
        };
    }

    function Required() {}

    function isRequired(object) {
        return object instanceof Required;
    }

    function extractPublicMembers(descriptor) {
        var hasPublicMembers = hasOwnProperty.call(descriptor, "public");
        var publicMembers = hasPublicMembers ? descriptor["public"] : {};

        if (typeof publicMembers !== "object") {
            throw new Error("\"public\" has to be an object.");
        }

        Object_keys(publicMembers).forEach(function (name) {
            var item = publicMembers[name];

            if (!isRequired(item) && typeof item !== "function") {
                throw new Error("\"public\" can only contain functions or " + " \"required\" declarations (" + JSON.stringify(publicMembers) + ")");
            }

            publicMembers[name] = {
                member: item,
                publicName: name,
                privateName: name
            };
        });

        return {
            publicMembers: publicMembers
        };
    }

    function extractPrivateMembers(descriptor) {
        var hasPrivateMembers = hasOwnProperty.call(descriptor, "private");

        var privateMembers = hasPrivateMembers ? descriptor["private"] : {};

        if (typeof privateMembers !== "object") {
            throw new Error("\"private\" has to be an object.");
        }

        Object_keys(privateMembers).forEach(function (name) {
            if (typeof privateMembers[name] !== "function") {
                throw new Error("\"private\" can only contain functions (" + JSON.stringify(privateMembers) + ")");
            }
        });

        return {
            privateMembers: privateMembers
        };
    }

    // Our expando property being used to store trait meta data
    var expando = "__jeo_trait" + Math.round(Math.random() * 1000000000);

    // This is a private key for securing our meta data against manipulation
    var secretEvidence = { isTrait: true };

    function storeMetaData(metaData) {
        return function checkEvidenceValid(givenEvidence) {
            if (givenEvidence === secretEvidence) {
                return metaData;
            } else {
                return undefined;
            }
        };
    }

    function retrieveMetaData(t) {
        if (typeof t[expando] === "function") {
            return t[expando](secretEvidence);
        } else {
            return undefined;
        }
    }

    function isTrait(object) {
        if (!object) {
            throw new Error("Argument to \"isTrait\" can not be null " + "or undefined.");
        }
        if (typeof object[expando] === "function") {
            return !!retrieveMetaData(object);
        } else {
            return false;
        }
    }

    function resolveDescriptor(descriptor, resolver) {
        var projection = Object_create(descriptor);
        var result = projection["public"] = {};
        var publicKeyMap = {};

        Object_keys(descriptor["public"]).forEach(function (name) {
            publicKeyMap[name] = true;

            var _descriptor$public$name = descriptor["public"][name];
            var member = _descriptor$public$name.member;
            var publicName = _descriptor$public$name.publicName;
            var privateName = _descriptor$public$name.privateName;

            var hasRule = hasOwnProperty.call(resolver, name);
            var rule = resolver[name];

            if (hasRule) {
                if (isRequired(member)) {
                    throw new Error("Can not resolve required " + "member \"" + name + "\".");
                }

                if (rule === null) {
                    if (publicName === null) {
                        // The member is already hidden from the
                        // public api
                        throw new Error("No public member \"" + name + "\" found");
                    }

                    // Hide
                    result[name] = {
                        member: member,
                        publicName: null,
                        privateName: privateName
                    };
                    return;
                }

                if (typeof rule === "string") {
                    // Rename
                    result[rule] = {
                        member: member,
                        publicName: rule,
                        privateName: privateName
                    };
                    return;
                }
            } else {
                // Copy
                result[name] = {
                    member: member,
                    publicName: publicName,
                    privateName: privateName
                };
            }
        });

        Object_keys(resolver).forEach(function (name) {
            if (!hasOwnProperty.call(publicKeyMap, name)) {
                throw new Error("\"" + name + "\" can not be resolved " + "because it is not a public method on " + JSON.stringify(descriptor));
            }
        });

        return projection;
    }

    function makeTrait(descriptor) {

        var t = {
            resolve: function resolve(resolver) {
                return makeTrait(resolveDescriptor(descriptor, resolver));
            }
        };
        t.create = createToplevelInstanceFactory(t);
        t[expando] = storeMetaData(descriptor);

        return Object_freeze(t);
    }

    function makeHash(t) {
        var publicMembers = retrieveMetaData(t)["public"];
        var hash = Object_keys(publicMembers).map(function (name) {
            return publicMembers[name].publicName;
        }).filter(function (m) {
            return m !== null;
        });
        hash.sort();
        return hash.join("#");
    }

    function closeOverInstance(instance, config) {
        // DEBUG
        instance.contexts = [];
        // DEBUG-END

        return function applyStatefulTrait(t) {
            var _config$for$filter = config["for"].filter(function (tt) {
                return tt.trait === t;
            });

            var _config$for$filter2 = _slicedToArray(_config$for$filter, 1);

            var substitute = _config$for$filter2[0];

            if (substitute) {
                var substituteHash = makeHash(substitute.use);
                var hashOfT = makeHash(t);

                if (hashOfT !== substituteHash) {
                    throw new Error("Substitute hash \"" + substituteHash + "\" does not match the hash \"" + hashOfT + "\" of " + "the trait to be substituted");
                }
                t = substitute.use;
            }

            var descriptor = retrieveMetaData(t);
            var publicMembers = descriptor["public"];
            var privateMembers = descriptor["private"];
            var dependencies = descriptor.requires.map(function (dep) {
                return createInstance(dep, config);
            });

            var privateContext = {};

            // DEBUG
            instance.contexts.push(privateContext);
            // DEBUG-END

            descriptor.constructor.apply(privateContext, dependencies);

            Object_keys(privateMembers).forEach(function (name) {
                var member = privateMembers[name];

                if (isRequired(member)) {
                    throw new Error("Private members can not be " + "required");
                }

                if (hasOwnProperty.call(privateContext, name)) {
                    throw new Error("Can not overwrite member \"" + name + "\" which has previously been defined");
                }

                privateContext[name] = function () {
                    return member.apply(privateContext, arguments);
                };
            });

            Object_keys(publicMembers).forEach(function (name) {
                var _publicMembers$name = publicMembers[name];
                var member = _publicMembers$name.member;
                var publicName = _publicMembers$name.publicName;
                var privateName = _publicMembers$name.privateName;

                if (hasOwnProperty.call(privateContext, privateName)) {
                    throw new Error("Can not overwrite member \"" + name + "\" which has previously been defined");
                }

                var memberIsRequired = isRequired(member);
                var fn = function fn() {
                    return member.apply(privateContext, arguments);
                };

                var instanceHasMemberWithSameName = hasOwnProperty.call(instance, publicName);

                var instanceMemberWithSameNameIsRequired = instanceHasMemberWithSameName && isRequired(instance[publicName]);

                var instanceMemberWithSameNameIsImplementation = instanceHasMemberWithSameName && !isRequired(instance[publicName]);

                if (memberIsRequired && instanceMemberWithSameNameIsRequired) {} else if (memberIsRequired && instanceMemberWithSameNameIsImplementation) {} else if (memberIsRequired && !instanceHasMemberWithSameName) {
                    // This declares a new required member and
                    // we still wait for the implementation
                    instance[publicName] = member;
                } else if (!memberIsRequired && (instanceMemberWithSameNameIsRequired || !instanceHasMemberWithSameName)) {
                    // Overwrite the required statement with the
                    // specified implementation
                    privateContext[privateName] = fn;

                    if (publicName !== null) {
                        instance[publicName] = fn;
                    }
                } else {
                    throw new Error("Unknown composition pattern");
                }
            });
        };
    }

    function createInstance(t, config) {
        if (!isTrait(t)) {
            throw new Error("The argument \"" + JSON.stringify(t) + "\" is " + "not a trait and therefore can not be instantiated.");
        }

        var descriptor = retrieveMetaData(t);
        var instance = {};
        var traits = [t].concat(descriptor.is);

        var applyStatefulTrait = closeOverInstance(instance, config);
        traits.forEach(applyStatefulTrait);

        Object_keys(instance).forEach(function (name) {
            var member = instance[name];

            if (isRequired(member)) {
                throw new Error("Can not instantiate incomplete " + "trait. The member \"" + name + "\" is still required.");
            }
        });

        return instance;
    }

    // The main entry point for our library
    function trait(_x) {
        var _arguments = arguments;
        var _again = true;

        _function: while (_again) {
            _again = false;
            var descriptor = _x;
            args = _extractDependencies = constructor = requires = _extractTraits = traits = _extractMain = main = _extractPublicMembers = publicMembers = _extractPrivateMembers = privateMembers = undefined;

            if (_arguments.length > 1) {
                var args = [].slice.call(_arguments).map(function (arg) {
                    if (!arg) {
                        throw new Error("A top level argument can not be falsy");
                    }

                    if (!isTrait(arg)) {
                        return trait({ "public": arg });
                    } else {
                        return arg;
                    }
                });
                _arguments = [_x = { is: args }];
                _again = true;
                continue _function;
            }

            if (typeof descriptor === "function") {
                descriptor = descriptor(createInstance(trait.Util, trait.config));
            }

            var _extractDependencies = extractDependencies(descriptor);

            var constructor = _extractDependencies.constructor;
            var requires = _extractDependencies.requires;

            var _extractTraits = extractTraits(descriptor);

            var traits = _extractTraits.traits;

            var _extractMain = extractMain(descriptor);

            var main = _extractMain.main;

            var _extractPublicMembers = extractPublicMembers(descriptor);

            var publicMembers = _extractPublicMembers.publicMembers;

            var _extractPrivateMembers = extractPrivateMembers(descriptor);

            var privateMembers = _extractPrivateMembers.privateMembers;

            return makeTrait({
                is: traits,
                requires: requires,
                constructor: constructor,
                main: main,
                "public": publicMembers,
                "private": privateMembers
            });
        }
    }

    function createToplevelInstanceFactory(t) {
        return function createToplevelInstance() {
            var config = arguments[0] === undefined ? {} : arguments[0];

            var currentConfig = mix(trait.config, config);

            currentConfig["for"].forEach(function (item) {
                if (!isTrait(item.trait)) {
                    throw new Error("Invalid configured dependency");
                }
                if (!isTrait(item.use)) {
                    throw new Error("Invalid substituted dependency " + "configured");
                }
            });

            return createInstance(t, currentConfig);
        };
    }

    return {
        trait: Object_freeze(mix(trait, {
            Util: trait({
                "public": {
                    assert: assert,
                    log: function log() {
                        console.log.apply(console, arguments);
                    },
                    mix: mix,
                    requires: requires
                }
            }),
            config: { "for": [] },
            isTrait: isTrait,
            required: Object_freeze(new Required())
        }))
    };
});

/* -===========================- 80 chars width -=========================- */

// Do nothing, both are required so we
// wait for an actual implementation

// Do nothing, the implementation is already
// attached to the instance
//# sourceMappingURL=jeo-debug.js.map