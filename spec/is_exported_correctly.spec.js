/*jshint esnext: true */
/*global require,describe,it,expect */

const { trait } = require('../src/jeo');

describe('The JEO trait and dependency injection library', () => {

    describe('when required, the exported object', () => {

        it('should be a function', () => {
            expect(trait).toBeDefined();
            expect(typeof trait).toBe('function');
        });

        it('should have an unary "isTrait" function attached', () => {
            expect(typeof trait.isTrait).toBe('function');
            expect(trait.isTrait.length).toBe(1);
        });

        it('should make sure that "isTrait" can not be called with null or undefined', () => {
            expect(() => trait.isTrait(null)).toThrow();
            expect(() => trait.isTrait(undefined)).toThrow();
        });

        it('should have a "Util" trait that contains the utility library', () => {
            expect(trait.isTrait(trait.Util)).toBe(true);
        });

        it('should have a "config" property that contains the default configuration', () => {
            expect(typeof trait.config === 'object').toBe(true);
        });

        it('should have a "required" object that can be used to declare required functionality for a trait', () => {
            expect(typeof trait.required === 'object').toBe(true);
        });

    });
});
