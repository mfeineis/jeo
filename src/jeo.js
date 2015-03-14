/*! %%NAME%% v%%VERSION%% (c) %%YEAR%% %%AUTHOR%%, %%LICENSE%% license (%%REPOSITORY%%) */
/*jshint esnext:true, maxlen:80 */
/*global define,module */
(function (global, name, factory) {
    'use strict';

    if (typeof define !== 'undefined' && define.amd) {
        // AMD
        define([], factory);
    }
    else if (typeof module !== 'undefined') {
        // CommonJS
        module.exports = factory();
    }
    else {
        // No modules
        global[name] = factory();
    }

}((0, eval)('this'), 'jeo', () => {
    'use strict';

    const Object_create = Object.create;
    const Object_freeze = Object.freeze;
    const Object_keys = Object.keys;
    const hasOwnProperty = {}.hasOwnProperty;

    function mix(to, from = {}) {
        
        Object_keys(from).forEach(key => {
            to[key] = from[key];
        });

        return to;
    }

    function assert(condition, message = 'An assertion failed.') {
        if (!condition) {
            throw new Error(message);
        }
    }

    // Used to check preconditions
    function requires(
        condition, 
        message = 'A precondition has been violated.') {
        if (!condition) {
            throw new Error(message);
        }
    }
    requires.not = {};

    var requiresExtensions = {
        toBeDefined(object) {
            return typeof object !== 'undefined';
        },
        toBeNull(object) {
            return object === null;
        }
    };

    // Putting the extensions and their inverses onto the
    // requires function
    Object_keys(requiresExtensions).forEach(key => {

        requires[key] = (function (extension) {
            return function (thingy, message) {
                const ok = extension(...arguments);
                requires(ok, message);
            };
        }(requiresExtensions[key]));

        requires.not[key] = (function (extension) {
            return function (thingy, message) {
                const ok = !extension(...arguments);
                requires(ok, message);
            };
        }(requiresExtensions[key]));

    });

    function extractDependencies(descriptor) {
        requires.toBeDefined(descriptor, 'No descriptor specified.');
        requires.not.toBeNull(descriptor, 'A descriptor can not be null.');

        const constructor = hasOwnProperty.call(descriptor, 'constructor') 
            ? descriptor.constructor
            : function () {};
        const constructorArgumentCount = constructor.length;

        if (typeof constructor !== 'function') {
            throw new Error('"constructor" must be a function.');
        }

        const hasRequires = hasOwnProperty.call(descriptor, 'requires');
        const requiresSetting = hasRequires
            ? (Array.isArray(descriptor.requires) 
                ? descriptor.requires
                : [descriptor.requires])
            : [];
        const dependencyCount = requiresSetting.length;

        if (constructorArgumentCount === 0 && dependencyCount > 0) {
            throw new Error('"requires" is not allowed to provide ' +
                    'dependencies when the constructor doesn\'t require any');
        }

        if (constructorArgumentCount !== dependencyCount) {
            throw new Error('"requires" has to provide the same amount of ' +
                    'dependencies that the constructor declares (' + 
                        JSON.stringify(descriptor) + ')');
        }

        requiresSetting.forEach(dependency => {
           if (!isTrait(dependency)) {
               throw new Error('"' + JSON.stringify(dependency) +'" is not ' +
                   'a valid trait');
           } 
        });

        return {
            constructor: constructor,
            requires: requiresSetting
        };
    }

    function extractTraits(descriptor) {
        const hasTraits = hasOwnProperty.call(descriptor, 'is');
        const traits = hasTraits
            ? (Array.isArray(descriptor.is)
                ? descriptor.is
                : [descriptor.is])
            : [];

        traits.forEach(t => {
            if (!isTrait(t)) {
                throw new Error('"' + JSON.stringify(t) + '" is not ' +
                    'a valid trait');
            }
        });

        return {
            traits: traits
        };
    }

    function extractMain(descriptor) {
        const hasMain = hasOwnProperty.call(descriptor, 'main');
        const main = hasMain
            ? descriptor.main
            : function () {};

        if (typeof main !== 'function') {
            throw new Error('"main", if provided has to be a function.');
        }

        return {
            main: main
        };
    }

    function Required() {}

    function isRequired(object) {
        return object instanceof Required;
    }

    function extractPublicMethods(descriptor) {
        const hasPublicMethods = hasOwnProperty.call(descriptor, 'public');
        const publicMethods = hasPublicMethods
            ? descriptor.public
            : {};

        if (typeof publicMethods !== 'object') {
            throw new Error('"public" has to be an object.');
        }

        Object_keys(publicMethods).forEach(name => {
            const item = publicMethods[name];

            if (!isRequired(item) && typeof item !== 'function') {
                throw new Error('"public" can only contain functions or ' +
                    ' "required" declarations (' +
                    JSON.stringify(publicMethods) + ')');
            }
        });

        return {
            publicMethods: publicMethods
        };
    }

    function extractPrivateMethods(descriptor) {
        const hasPrivateMethods = hasOwnProperty.call(descriptor, 'private');

        const privateMethods = hasPrivateMethods
            ? descriptor.private
            : {};

        if (typeof privateMethods !== 'object') {
            throw new Error('"private" has to be an object.');
        }

        Object_keys(privateMethods).forEach(name => {
            if (typeof privateMethods[name] !== 'function') {
                throw new Error('"private" can only contain functions (' +
                    JSON.stringify(privateMethods) + ')');
            }
        });

        return {
            privateMethods: privateMethods
        };
    }

    // Our expando property being used to store trait meta data
    const expando = '__jeo_trait' + Math.round(Math.random() * 1000000000);

    // This is a private key for securing our meta data against manipulation
    const secretEvidence = { isTrait: true };

    function storeMetaData(metaData) {
        return function checkEvidenceValid(givenEvidence) {
            if (givenEvidence === secretEvidence) {
                return metaData;
            }
            else {
                return undefined;
            }
        };
    }

    function retrieveMetaData(t) {
        if (typeof t[expando] === 'function') {
            return t[expando](secretEvidence);
        }
        else {
            return undefined;
        }
    }

    function isTrait(object) {
        if (typeof object[expando] === 'function') {
            return !!retrieveMetaData(object);
        }
        else {
            return false;
        }
    }

    function resolveDescriptor(descriptor, resolver) {
        const projection = Object_create(descriptor);
        const result = projection.public = {};
        const publicKeyMap = {};

        Object_keys(descriptor.public)
            .forEach(name => {
                publicKeyMap[name] = true;

                const member = descriptor.public[name];

                const hasRule = hasOwnProperty.call(resolver, name);
                const rule = resolver[name];
                
                if (hasRule) {
                    if (isRequired(member)) {
                        throw new Error('Can not resolve required ' +
                            'member "' + name + '".');
                    }

                    if (rule === null) {
                        // Hide
                        return;
                    }

                    if (typeof rule === 'string') {
                        // Rename
                        result[rule] = member;
                    }
                }
                else {
                    // Copy
                    result[name] = member;
                }
            });

        Object_keys(resolver).forEach(name => {
            if (!hasOwnProperty.call(publicKeyMap, name)) {
                throw new Error('"' + name + '" can not be resolved ' +
                    'because it is not a public method on ' + 
                    JSON.stringify(descriptor));
            }
        });

        return projection;
    }

    function makeTrait(descriptor) {

        const t = {
            resolve(resolver) {
                return makeTrait(resolveDescriptor(descriptor, resolver));
            }
        };
        t.create = createToplevelInstanceFactory(t);
        t[expando] = storeMetaData(descriptor);

        return Object_freeze(t);
    }

    function makeHash(t) {
        const publicMembers = retrieveMetaData(t).public;
        let hash = Object_keys(publicMembers);
        hash.sort();
        return hash.join('#');
    }

    function closeOverInstance(instance, config) {
        return function applyStatefulTrait(t) {
            let [substitute] = config.for.filter(tt => tt.trait === t);
            if (substitute) {
                let substituteHash = makeHash(substitute.use);
                let hashOfT = makeHash(t);

                if (hashOfT !== substituteHash) {
                    throw new Error('Substiute hash "' + substituteHash + 
                        '" does not match the hash "' + hashOfT + '" of ' +
                        'the trait to be substituted');
                }
                t = substitute.use;
            }

            const descriptor = retrieveMetaData(t);
            const publicMembers = descriptor.public;
            const privateMembers = descriptor.private;
            const dependencies = descriptor.requires
                .map(dep => createInstance(dep, config));

            const privateContext = {};
            
            descriptor.constructor.apply(privateContext, dependencies);

            Object_keys(privateMembers)
                .forEach(name => {
                    const member = privateMembers[name];

                    if (isRequired(member)) {
                        throw new Error('Private members can not be ' +
                            'required');
                    }

                    if (hasOwnProperty.call(privateContext, name)) {
                        throw new Error('Can not overwrite member "' +
                            name + '" which has previously been defined');
                    }

                    privateContext[name] = function () {
                        return member.apply(privateContext, arguments);
                    };
                });

            Object_keys(publicMembers)
                .forEach(name => {
                    if (hasOwnProperty.call(privateContext, name)) {
                        throw new Error('Can not overwrite member "' +
                            name + '" which has previously been defined');
                    }

                    const member = publicMembers[name];
                    const memberIsRequired = isRequired(member);
                    const fn = function () {
                        return member.apply(privateContext, arguments);
                    };

                    const instanceHasMemberWithSameName = 
                        hasOwnProperty.call(instance, name);

                    const instanceMemberWithSameNameIsRequired =
                        instanceHasMemberWithSameName &&
                            isRequired(instance[name]);

                    const instanceMemberWithSameNameIsImplementation =
                        instanceHasMemberWithSameName &&
                            !isRequired(instance[name]);

                    if (memberIsRequired && 
                        instanceMemberWithSameNameIsRequired) {
                        // Do nothing, both are required so we
                        // wait for an actual implementation
                    }
                    else if (memberIsRequired &&
                            instanceMemberWithSameNameIsImplementation) {
                        // Do nothing, the implementation is already
                        // attached to the instance
                    }
                    else if (memberIsRequired && 
                            !instanceHasMemberWithSameName) {
                        // This declares a new required member and
                        // we still wait for the implementation
                        instance[name] = member;
                    }
                    else if (!memberIsRequired &&
                            (instanceMemberWithSameNameIsRequired ||
                             !instanceHasMemberWithSameName)) {
                        // Overwrite the required statement with the
                        // specified implementation
                        privateContext[name] = fn;
                        instance[name] = fn;
                    }
                    else {
                        throw new Error('Unknown composition pattern');
                    }
                });
        };
    }

    function createInstance(t, config) {
        if (!isTrait(t)) {
            throw new Error('The argument "' + JSON.stringify(t) + '" is ' +
                'not a trait and therefore can not be instantiated.');
        }

        const descriptor = retrieveMetaData(t);
        let instance = {};
        let traits = [t].concat(descriptor.is);

        const applyStatefulTrait = closeOverInstance(instance, config);
        traits.forEach(applyStatefulTrait);

        Object_keys(instance).forEach(name => {
            const member = instance[name];

            if (isRequired(member)) {
                throw new Error('Can not instantiate incomplete ' +
                    'trait. The member "' + name + 
                    '" is still required.');
            }
        });

        return instance;
    }

    // The main entry point for our library
    function trait(descriptor) {
        if (arguments.length > 1) {
            const args = [].slice.call(arguments).map(arg => {
                if (!arg) {
                    throw new Error('A top level argument can not be falsy');
                }

                if (!isTrait(arg)) {
                    return trait({ public: arg });
                }
                else {
                    return arg;
                }
            });
            return trait({ is: args });
        }

        if (typeof descriptor === 'function') {
            descriptor = descriptor(createInstance(trait.Util, trait.config));
        }

        let { constructor, requires } = extractDependencies(descriptor);
        let { traits } = extractTraits(descriptor);
        let { main } = extractMain(descriptor);
        let { publicMethods } = extractPublicMethods(descriptor);
        let { privateMethods } = extractPrivateMethods(descriptor);

        return makeTrait({
            is: traits,
            requires: requires,
            constructor: constructor,
            main: main,
            public: publicMethods,
            private: privateMethods
        });
    }

    function createToplevelInstanceFactory(t) {
        return function createToplevelInstance(config = {}) {
            const currentConfig = mix(trait.config, config);

            currentConfig.for.forEach(item => {
                if (!isTrait(item.trait)) {
                    throw new Error('Invalid configured dependency');
                }
                if (!isTrait(item.use)) {
                    throw new Error('Invalid substituted dependency ' +
                        'configured');
                }
            });

            return createInstance(t, currentConfig);
        };
    }

    return {
        trait: Object_freeze(mix(trait, {
            Util: trait({
                public: {
                    assert: assert,
                    log() { console.log(...arguments); },
                    mix: mix,
                    requires: requires
                }
            }),
            config: { for: [] },
            isTrait: isTrait,
            required: Object_freeze(new Required())
        }))
    };
}));





































