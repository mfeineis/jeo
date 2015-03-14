/*jshint esnext: true */
/*global require,describe,it,expect */

const { trait } = require('../src/jeo');

describe('A JEO trait', () => {
    const validTrait = trait({ 
        public: { 
            hideMe() { return true; }, 
            renameMe() { return true; },
            requiredMember: trait.required,
            touchPublicMemberPrivately() {
                return this.hideMe() && this.renameMe();
            }
        }
    });
    const invalidTrait = trait({ public: { hihi: function () {} } });
    const anotherTrait = trait({
        public: {
            requiredMember() { return 42; },
            anotherMember() { return 314159265; }
        }
    });

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

        it('should make sure that only the public reference is hidden but a private instance is still available', () => {
            expect(trait({ requiredMember() { } }, validTrait.resolve({ hideMe: null })).create().touchPublicMemberPrivately()).toBe(true);
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

        it('should make sure that only the public reference is renamed but a private instance is still available', () => {
            expect(trait({ requiredMember() { } }, validTrait.resolve({ renameMe: 'renamed' })).create().touchPublicMemberPrivately()).toBe(true);
        });

    });

    describe('when composed with another trait that provides a required member', () => {

        it('should allow the trait to be created correctly', () => {
            expect(trait(validTrait, anotherTrait).create().requiredMember()).toBe(42);
        });

    });

});
