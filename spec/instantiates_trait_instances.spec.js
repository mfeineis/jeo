/*jshint esnext: true */
/*global require,describe,it,expect */

const { trait } = require('../src/jeo');

describe('A JEO trait', () => {

    describe('when creating a trait instance using the "create" function', () => {
        const t = trait({
            public: {
                methodA() {}
            }
        });
        const incomplete = trait({
            public: {
                requiredMember: trait.required,
                methodB() {}
            }
        });

        it('should have a "create" function', () => {
            expect(typeof t.create === 'function').toBe(true);
        });

        it('should instantiate the specified trait containing the public methods', () => {
            const instance = t.create();
            expect(typeof instance.methodA).toBe('function');
        });

        it('should not instantiate an incomplete trait that still has required members', () => {
            expect(() => incomplete.create()).toThrow();
        });

        it('should run the constructor on the plain instance before any methods are available', () => {
            let context = null;
            let membersAvailableInConstructor = [];
            const t2 = trait({ 
                constructor() { 
                    context = this;
                    Object.keys(this).forEach(key => {
                        membersAvailableInConstructor.push(key);
                    });
                },
                public: { methodC() { } }
            });
            t2.create();
            expect(context).not.toBeNull();
            expect(membersAvailableInConstructor.length).toBe(0);
        });

        it('should not expose public state in the form of properties', () => {
            let context = null;
            const t2 = trait({ 
                constructor() { 
                    this.privateMember = true;
                    context = this;
                },
                public: { methodC() { } }
            });
            const instance = t2.create();
            expect(typeof instance.privateMember).toBe('undefined');
        });

        it('should allow public methods to access private state', () => {
            let context = null;
            const privateValue = 'blubb';
            const t2 = trait({ 
                constructor() { 
                    this.privateMember = privateValue;
                    context = this;
                },
                public: {
                    methodC() {
                        return this.privateMember;
                    }
                }
            });
            const instance = t2.create();
            expect(instance.methodC()).toBe(privateValue);
        });

        it('should prevent private methods to be accessable from the outside', () => {
            const t2 = trait({ 
                private: {
                    privateMethod() {}
                }
            });
            expect(t2.create().privateMethod).not.toBeDefined();
        });

        it('should prevent private methods to be required', () => {
            expect(() => trait({ 
                private: {
                    methodC: trait.required
                }
            })).toThrow();
        });

        it('should prevent private methods to overwrite other members with the same name', () => {
            const t2 = trait({ 
                constructor() {
                    this.privateMember = true;
                },
                private: {
                    privateMember() {}
                }
            });
            expect(() => t2.create()).toThrow();
        });

        it('should prevent public methods to overwrite other members with the same name', () => {
            const t2 = trait({ 
                constructor() {
                    this.privateMember = true;
                },
                public: {
                    privateMember() {}
                }
            });
            expect(() => t2.create()).toThrow();
        });

        it('should allow public methods to access other public and private methods', () => {
            const privateValue = 'blubb';
            const anotherValue = 'bla';
            const t2 = trait({ 
                constructor() { 
                    this.privateMember = privateValue;
                    this.anotherMember = anotherValue;
                },
                public: {
                    methodC() {
                        return this.privateMember;
                    },
                    methodD() {
                        return this.methodC();
                    },
                    methodE() {
                        return this.privateMethod();
                    }
                },
                private: {
                    privateMethod() {
                        return this.anotherMember;
                    }
                }
            });
            const instance = t2.create();
            expect(instance.methodD()).toBe(privateValue);
            expect(instance.methodE()).toBe(anotherValue);
        });

        describe('when composing traits', () => {

            const t1 = trait({ 
                public: {
                    method: trait.required
                }
            });

            const t2 = trait({ 
                public: {
                    method() {}
                }
            });

            const t3 = trait({ 
                public: {
                    method() {}
                }
            });

            const t4 = trait({
                public: {
                    method: trait.required
                }
            });

            it('should allow overriding members with the same name as long as exactly one of them is not a required statement', () => {
                const tx = trait({
                    is: [t1, t2, t4]
                });

                expect(() => tx.create()).not.toThrow();
            });

            it('should prevent overriding members with the same name when at least two of them are not required statements', () => {
                const ty = trait({
                    is: [t1, t2, t3]
                });

                expect(() => ty.create()).toThrow();
            });

            it('should prevent overriding members with the same name when all of them are required statements', () => {
                const tz = trait({
                    is: [t1, t4]
                });

                expect(() => tz.create()).toThrow();
            });

        });

        describe('when a trait declares dependencies it', () => {

            it('should be handed instances of the specified dependencies into the constructor in the right order', () => {
                let dep1Created = 0;
                let dep2Created = false;

                const dep1 = trait({
                    constructor() {
                        dep1Created += 1;
                    },
                    public: {
                        isDep1() {}
                    }
                });
                const dep2 = trait({
                    is: dep1,
                    constructor() {
                        dep2Created = true;
                    },
                    public: {
                        isDep2() {}
                    }
                });

                const t = trait({
                    requires: [dep1, dep2],
                    constructor(a, b) {
                        expect(typeof a.isDep1).toBe('function');
                        expect(typeof b.isDep2).toBe('function');
                        expect(typeof b.isDep1).toBe('function');
                    }
                });

                t.create();
                expect(dep1Created).toBe(2);
                expect(dep2Created).toBe(true);
            });

        });

        describe('when a trait is being created via "create(config?)" with a configuration it', () => {

            const t1 = trait({
                public: {
                    first() { 
                        return 1;
                    }
                }
            });

            const t1Impl = trait({
                public: {
                    first() { 
                        return 2;
                    }
                }
            });

            const t2 = trait({
                public: {
                    first: trait.required
                }
            });

            const t3 = trait({
                public: {
                    first() {
                        return 3;
                    },
                    blubb() { }
                }
            });

            const tx = trait({
                is: t1,
                requires: t1,
                constructor(t1) {
                    this.dep1 = t1;
                },
                public: {
                    second() { 
                        return this.dep1.first();
                    }
                }
            });

            it('should make sure that both the configured dependency and the substitute are traits', () => {
                expect(() => t1.create({
                    for: [
                        { trait: t1, use: { boo: 'ooom' } }
                    ]
                })).toThrow();

                expect(() => t1.create({
                    for: [
                        { trait: { boo: 'ooom' }, use: t1 }
                    ]
                })).toThrow();

                expect(() => t1.create({
                    for: [
                        { trait: { boo: 'ooom' }, use: { boo: 'ooom' } }
                    ]
                })).toThrow();
            });

            it('should be possible to be substituted itself by a configured dependency', () => {
                const t = t1.create({
                    for: [
                        { trait: t1, use: t1Impl }
                    ]
                });
                
                expect(t.first()).toBe(2);
            });

            it('should verify that a configured dependency can be substituted for the original dependency', () => {
                expect(() => tx.create({
                    for: [
                        { trait: t1, use: t3 }
                    ]
                })).toThrow();
                
                const t = tx.create({
                    for: [
                        { trait: t1, use: t3.resolve({ blubb: null }) }
                    ]
                });

                expect(t.first()).toBe(3);
            });

            it('should substitute the original dependencies for the configured ones', () => {

                const t = tx.create({
                    for: [
                        { trait: t1, use: t1Impl }
                    ]
                });

                expect(t.first()).toBe(2);
                expect(t.second()).toBe(2);
            });

            describe('when composing traits ad hoc via "trait(t1, t2, ..., tn)" it', () => {

                it('should support plain objects to provide public apis in case at least two arguments are supplied', () => {
                    const t = trait({ first() { return 4; } }, t2).create();
                    expect(t.first()).toBe(4);
                    
                    expect(() => trait(t1, null).create()).toThrow();
                    expect(() => trait(t1, undefined).create()).toThrow();
                    expect(() => trait(t1, '').create()).toThrow();
                    expect(() => trait(t1, 0).create()).toThrow();
                });

                it('should return a new trait composed of the specified traits', () => {
                    const t = trait(t1.resolve({ first: null }), t2, t3).create();

                    expect(t.first()).toBe(3);
                });

            });

        });

    });

});



































