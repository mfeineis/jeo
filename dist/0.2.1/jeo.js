!function r(e,n,t){function i(u,a){if(!n[u]){if(!e[u]){var c="function"==typeof require&&require;if(!a&&c)return c(u,!0);if(o)return o(u,!0);throw new Error("Cannot find module '"+u+"'")}var f=n[u]={exports:{}};e[u][0].call(f.exports,function(r){var n=e[u][1][r];return i(n?n:r)},f,f.exports,r,e,n,t)}return n[u].exports}for(var o="function"==typeof require&&require,u=0;u<t.length;u++)i(t[u]);return i}({1:[function(r,e){"use strict";var n=function(r,e){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r)){for(var n,t=[],i=r[Symbol.iterator]();!(n=i.next()).done&&(t.push(n.value),!e||t.length!==e););return t}throw new TypeError("Invalid attempt to destructure non-iterable instance")};/*! jeo v0.2.1 (c) 2015 Martin Feineis, MIT license (https://www.github.com/mfeineis/jeo) */
!function(r,n,t){"undefined"!=typeof define&&define.amd?define([],t):"undefined"!=typeof e?e.exports=t():r[n]=t()}((0,eval)("this"),"jeo",function(){function r(r){var e=void 0===arguments[1]?{}:arguments[1];return q(e).forEach(function(n){r[n]=e[n]}),r}function e(r){var e=void 0===arguments[1]?"An assertion failed.":arguments[1];if(!r)throw new Error(e)}function t(r){var e=void 0===arguments[1]?"A precondition has been violated.":arguments[1];if(!r)throw new Error(e)}function i(r){t.toBeDefined(r,"No descriptor specified."),t.not.toBeNull(r,"A descriptor can not be null.");var e=O.call(r,"constructor")?r.constructor:function(){},n=e.length;if("function"!=typeof e)throw new Error('"constructor" must be a function.');var i=O.call(r,"requires"),o=i?Array.isArray(r.requires)?r.requires:[r.requires]:[],u=o.length;if(0===n&&u>0)throw new Error('"requires" is not allowed to provide dependencies when the constructor doesn\'t require any');if(n!==u)throw new Error('"requires" has to provide the same amount of dependencies that the constructor declares ('+JSON.stringify(r)+")");return o.forEach(function(r){if(!v(r))throw new Error('"'+JSON.stringify(r)+'" is not a valid trait')}),{constructor:e,requires:o}}function o(r){var e=O.call(r,"is"),n=e?Array.isArray(r.is)?r.is:[r.is]:[];return n.forEach(function(r){if(!v(r))throw new Error('"'+JSON.stringify(r)+'" is not a valid trait')}),{traits:n}}function u(r){var e=O.call(r,"main"),n=e?r.main:function(){};if("function"!=typeof n)throw new Error('"main", if provided has to be a function.');return{main:n}}function a(){}function c(r){return r instanceof a}function f(r){var e=O.call(r,"public"),n=e?r["public"]:{};if("object"!=typeof n)throw new Error('"public" has to be an object.');return q(n).forEach(function(r){var e=n[r];if(!c(e)&&"function"!=typeof e)throw new Error('"public" can only contain functions or  "required" declarations ('+JSON.stringify(n)+")");n[r]={member:e,publicName:r,privateName:r}}),{publicMembers:n}}function s(r){var e=O.call(r,"private"),n=e?r["private"]:{};if("object"!=typeof n)throw new Error('"private" has to be an object.');return q(n).forEach(function(r){if("function"!=typeof n[r])throw new Error('"private" can only contain functions ('+JSON.stringify(n)+")")}),{privateMembers:n}}function l(r){return function(e){return e===S?r:void 0}}function p(r){return"function"==typeof r[A]?r[A](S):void 0}function v(r){return"function"==typeof r[A]?!!p(r):!1}function m(r,e){var n=g(r),t=n["public"]={},i={};return q(r["public"]).forEach(function(n){i[n]=!0;var o=r["public"][n],u=o.member,a=o.publicName,f=o.privateName,s=O.call(e,n),l=e[n];if(s){if(c(u))throw new Error('Can not resolve required member "'+n+'".');if(null===l){if(null===a)throw new Error('No public member "'+n+'" found');return void(t[n]={member:u,publicName:null,privateName:f})}if("string"==typeof l)return void(t[l]={member:u,publicName:l,privateName:f})}else t[n]={member:u,publicName:a,privateName:f}}),q(e).forEach(function(e){if(!O.call(i,e))throw new Error('"'+e+'" can not be resolved because it is not a public method on '+JSON.stringify(r))}),n}function h(r){var e={resolve:function(e){return h(m(r,e))}};return e.create=E(e),e[A]=l(r),N(e)}function d(r){var e=p(r)["public"],n=q(e).map(function(r){return e[r].publicName}).filter(function(r){return null!==r});return n.sort(),n.join("#")}function b(r,e){return function(t){var i=e["for"].filter(function(r){return r.trait===t}),o=n(i,1),u=o[0];if(u){var a=d(u.use),f=d(t);if(f!==a)throw new Error('Substiute hash "'+a+'" does not match the hash "'+f+'" of the trait to be substituted');t=u.use}var s=p(t),l=s["public"],v=s["private"],m=s.requires.map(function(r){return w(r,e)}),h={};s.constructor.apply(h,m),q(v).forEach(function(r){var e=v[r];if(c(e))throw new Error("Private members can not be required");if(O.call(h,r))throw new Error('Can not overwrite member "'+r+'" which has previously been defined');h[r]=function(){return e.apply(h,arguments)}}),q(l).forEach(function(e){var n=l[e],t=n.member,i=n.publicName,o=n.privateName;if(O.call(h,o))throw new Error('Can not overwrite member "'+e+'" which has previously been defined');var u=c(t),a=function(){return t.apply(h,arguments)},f=O.call(r,i),s=f&&c(r[i]),p=f&&!c(r[i]);if(u&&s);else if(u&&p);else if(u&&!f)r[i]=t;else{if(u||!s&&f)throw new Error("Unknown composition pattern");h[o]=a,null!==i&&(r[i]=a)}})}}function w(r,e){if(!v(r))throw new Error('The argument "'+JSON.stringify(r)+'" is not a trait and therefore can not be instantiated.');var n=p(r),t={},i=[r].concat(n.is),o=b(t,e);return i.forEach(o),q(t).forEach(function(r){var e=t[r];if(c(e))throw new Error('Can not instantiate incomplete trait. The member "'+r+'" is still required.')}),t}function y(r){for(var e=arguments,n=!0;n;){n=!1;var t=r;O=a=c=l=p=m=d=b=E=g=N=q=void 0;{if(!(e.length>1)){"function"==typeof t&&(t=t(w(y.Util,y.config)));var a=i(t),c=a.constructor,l=a.requires,p=o(t),m=p.traits,d=u(t),b=d.main,E=f(t),g=E.publicMembers,N=s(t),q=N.privateMembers;return h({is:m,requires:l,constructor:c,main:b,"public":g,"private":q})}var O=[].slice.call(e).map(function(r){if(!r)throw new Error("A top level argument can not be falsy");return v(r)?r:y({"public":r})});e=[r={is:O}],n=!0}}}function E(e){return function(){var n=void 0===arguments[0]?{}:arguments[0],t=r(y.config,n);return t["for"].forEach(function(r){if(!v(r.trait))throw new Error("Invalid configured dependency");if(!v(r.use))throw new Error("Invalid substituted dependency configured")}),w(e,t)}}var g=Object.create,N=Object.freeze,q=Object.keys,O={}.hasOwnProperty;t.not={};var j={toBeDefined:function(r){return"undefined"!=typeof r},toBeNull:function(r){return null===r}};q(j).forEach(function(r){t[r]=function(r){return function(e,n){var i=r.apply(void 0,arguments);t(i,n)}}(j[r]),t.not[r]=function(r){return function(e,n){var i=!r.apply(void 0,arguments);t(i,n)}}(j[r])});var A="__jeo_trait"+Math.round(1e9*Math.random()),S={isTrait:!0};return{trait:N(r(y,{Util:y({"public":{assert:e,log:function(){console.log.apply(console,arguments)},mix:r,requires:t}}),config:{"for":[]},isTrait:v,required:N(new a)}))}})},{}]},{},[1]);
//# sourceMappingURL=jeo.js.map