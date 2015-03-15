/*jshint esnext: true */
/*global require,describe,it,expect */

const { trait } = require('../src/jeo');

describe('The JEO trait and dependency injection library export', () => {

    it('should throw, if called with no arguments', () => {
        expect(() => trait()).toThrow();
    });

    it('should throw, if called with null as the first argument', () => {
        expect(() => trait(null)).toThrow();
    });

    describe('when called with an empty descriptor as the first argument', () => {
        const emptyDescriptor = {};

        it('should accept the empty descriptor as a valid input', () => {
            expect(() => trait(emptyDescriptor)).not.toThrow();
        });

        it('should return an object for which the "isTrait" function returns true', () => {
            const t = trait(emptyDescriptor);
            expect(t).toBeDefined();
            expect(t).not.toBeNull();
            expect(trait.isTrait(t)).toBe(true);
        });

        it('should return an object that has two functions called "create" and "resolve" as well as an expando property', () => {
            const t = trait(emptyDescriptor);
            expect(typeof t.create).toBe('function');
            expect(typeof t.resolve).toBe('function');
            expect(Object.keys(t).length).toBe(3);
        });

    });

    describe('when called with a descriptor that contains a property named "constructor"', () => {

        const validDependency = trait({});
        const invalidDependency = 'SomeCrap';

        it('should verify that the value is a function', () => {
            expect(() => trait({ constructor: true })).toThrow();
            expect(() => trait({ constructor: 7 })).toThrow();
            expect(() => trait({ constructor: 'bla' })).toThrow();
            expect(() => trait({ constructor() {} })).not.toThrow();
        });

        it('should verify that the "requires" property does not provide dependencies when the constructor doesn\'t declare any', () => {
            expect(() => trait({ requires: validDependency })).toThrow();
            expect(() => trait({ requires: invalidDependency })).toThrow();
            expect(() => trait({
                requires: [invalidDependency, validDependency]
            })).toThrow();
        });

        it('should make sure that if the constructor has arguments the descriptor also has to have a "requires" property that declares the corresponding amount of dependencies', () => {
            expect(() => trait({ constructor(a) {} })).toThrow();

            expect(() => trait({ 
                constructor(a) {}, 
                requires: []
            })).toThrow();

            expect(() => trait({ 
                constructor(a) {}, 
                requires: [validDependency, validDependency]
            })).toThrow();

            expect(() => trait({
                constructor(a) {},
                requires: validDependency 
            })).not.toThrow();
        });

        it('should verify that the provided dependencies via "requires" are traits', () => {
            expect(() => trait({
                constructor(a) {},
                requires: 'blubb'
            })).toThrow();

            expect(() => trait({
                constructor(a) {},
                requires: true
            })).toThrow();

            expect(() => trait({
                constructor(a) {},
                requires: 1 
            })).toThrow();

            expect(() => trait({
                constructor(a) {},
                requires: {}
            })).toThrow();

            expect(() => trait({
                constructor(a) {},
                requires: [null]
            })).toThrow();
            
            expect(() => trait({
                constructor(a) {},
                requires: validDependency
            })).not.toThrow();
            
            expect(() => trait({
                constructor(a) {},
                requires: [validDependency]
            })).not.toThrow();
            
            expect(() => trait({
                constructor(a, b) {},
                requires: [validDependency, validDependency]
            })).not.toThrow();

            expect(() => trait({
                constructor(a, b, c) {},
                requires: [validDependency, invalidDependency, validDependency]
            })).toThrow();

            expect(() => trait({
                constructor(a, b, c) {},
                requires: [validDependency, validDependency, validDependency]
            })).not.toThrow();
        });

    });

    describe('when called with a descriptor that contains a property named "is"', () => {
        const validDependency = trait({});

        it('should verify that the provided objects are in fact traits', () => {

            expect(() => trait({ is: 'blubb' })).toThrow();
            expect(() => trait({ is: true })).toThrow();
            expect(() => trait({ is: {} })).toThrow();

            expect(() => trait({ is: validDependency })).not.toThrow();
            expect(() => trait({ is: [validDependency, validDependency] })).not.toThrow();

            expect(() => trait({ is: [null, validDependency] })).toThrow();
            expect(() => trait({ is: [undefined, validDependency] })).toThrow();
        });
        
        it('should allow an empty array', () => {
            expect(() => trait({ is: [] })).not.toThrow();
        });
    });

    describe('when called with a descriptor that contains a property named "main"', () => {
        const validDependency = trait({});

        it('should verify that the value is a function', () => {

            expect(() => trait({ main: 'blubb' })).toThrow();
            expect(() => trait({ main: true })).toThrow();
            expect(() => trait({ main: {} })).toThrow();
            expect(() => trait({ main: [] })).toThrow();
            expect(() => trait({ main: validDependency })).toThrow();

            expect(() => trait({ main: function () {} })).not.toThrow();
        });
        
    });

    describe('when called with a descriptor that contains a property named "public"', () => {

        it('should verify that the value is an object', () => {
            expect(() => trait({ public: true })).toThrow();
            expect(() => trait({ public: 'asdf' })).toThrow();
            expect(() => trait({ public: function () {} })).toThrow();
            expect(() => trait({ public: 1 })).toThrow();
            expect(() => trait({ public: 0 })).toThrow();

            expect(() => trait({ public: {} })).not.toThrow();
        });
        
        it('should verify that the object only contains functions or "required" declarations', () => {
            expect(() => trait({ 
                public: {
                    someMethod() {},
                    somethingDifferent: true,
                    anything: []
                } 
            })).toThrow();

            expect(() => trait({ 
                public: {
                    someRequiredThingy: trait.required,
                    someMethod() {}
                } 
            })).not.toThrow();
        });
        
    });

    describe('when called with a descriptor that contains a property named "private"', () => {

        it('should verify that the value is an object', () => {
            expect(() => trait({ private: true })).toThrow();
            expect(() => trait({ private: 'asdf' })).toThrow();
            expect(() => trait({ private: function () {} })).toThrow();
            expect(() => trait({ private: 1 })).toThrow();
            expect(() => trait({ private: 0 })).toThrow();

            expect(() => trait({ private: {} })).not.toThrow();
        });
        
        it('should verify that the object only contains functions', () => {
            expect(() => trait({ 
                private: {
                    someMethod() {},
                    somethingDifferent: true,
                    anything: []
                } 
            })).toThrow();

            expect(() => trait({ 
                private: {
                    someMethod() {}
                } 
            })).not.toThrow();
        });
        
    });

    describe('when called with a function taking no arguments instead of a descriptor', () => {

        it('should make sure it is immediately evaluated', () => {
            let hasBeenCalled = false;
            trait(() => {
                hasBeenCalled = true;
                return {};
            });
            expect(hasBeenCalled).toBe(true);
        });

        it('should make sure it returns a descriptor', () => {
            const t = trait(() => {
                return {};
            });
            expect(trait.isTrait(t)).toBe(true);
        });

    });

    describe('when called with a function taking one argument instead of a descriptor', () => {

        let hasBeenCalled = false;
        let lib = null;
        const t = trait(x => {
            hasBeenCalled = true;
            lib = x;
            return {};
        });

        it('should make sure it is immediately evaluated', () => {
            expect(hasBeenCalled).toBe(true);
        });

        it('should make sure it returns a descriptor', () => {
            expect(trait.isTrait(t)).toBe(true);
        });

        it('should provide an object as the first argument that contains utilities for defining traits', () => {
            expect(typeof lib).toBe('object');
            expect(typeof lib.assert).toBe('function');
            expect(typeof lib.log).toBe('function');
            expect(typeof lib.mix).toBe('function');
            expect(typeof lib.requires).toBe('function');
        });

    });

});



































