/*jshint esnext: true */
/*global require,describe,it,expect */

const trait = require('../src/jeo');

describe('A JEO trait', () => {
    const validTrait = trait({ 
        public: { 
            hideMe: function () {}, 
            renameMe: function () {},
            requiredMember: trait.required
        } 
    });
    const invalidTrait = trait({ public: { hihi: function () {} } });

    it('should have an unary "resolve" function', () => {
        expect(typeof validTrait.resolve).toBe('function');
        expect(validTrait.resolve.length).toBe(1);
    });

    describe('when hiding a public method by calling "resolve({ hideMe: null })" on it', () => {

        it('should verify that "hideMe" is actually a public method', () => {
            expect(() => invalidTrait.resolve({ hideMe: null })).toThrow();
            expect(() => validTrait.resolve({ hideMe: null })).not.toThrow();
        });

        it('should return a new trait', () => {
            expect(trait.isTrait(validTrait.resolve({ hideMe: null }))).toBe(true);
        });

        it('should make sure that the returned trait is different from the original trait', () => {
            expect(validTrait.resolve({ hideMe: null })).not.toBe(validTrait);
        });

        it('should hide the public method "hideMe" on the new trait', () => {
            expect(() => validTrait.resolve({ hideMe: null }).resolve({ hideMe: null })).toThrow();
        });

        it('should prevent hiding required members', () => {
            expect(() => validTrait.resolve({ requiredMember: null })).toThrow();
        });

    });

    describe('when renaming a public method by calling "resolve({ renameMe: \'renamed\' })" on it', () => {

        it('should verify that "renameMe" is actually a public method', () => {
            expect(() => invalidTrait.resolve({ renameMe: 'renamed' })).toThrow();
            expect(() => validTrait.resolve({ renameMe: 'renamed' })).not.toThrow();
        });

        it('should return a new trait', () => {
            expect(trait.isTrait(validTrait.resolve({ renameMe: 'renamed' }))).toBe(true);
        });

        it('should make sure that the returned trait is different from the original trait', () => {
            expect(validTrait.resolve({ renameMe: 'renamed' })).not.toBe(validTrait);
        });

        it('should rename the public method "renameMe" on the new trait to "renamed"', () => {
            const t = validTrait.resolve({ renameMe: 'renamed' });
            expect(() => t.resolve({ renameMe: 'renamed' })).toThrow();
            expect(() => t.resolve({ renamed: 'renamedAnotherTime' })).not.toThrow();
        });

        it('should prevent renaming required members', () => {
            expect(() => validTrait.resolve({ requiredMember: 'renamedRequiredMember' })).toThrow();
        });

    });

});
