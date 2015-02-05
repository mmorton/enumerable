/*!
 * enumerable v3.0
 * Copyright 2015, Michael Morton
 *
 * MIT Licensed - See LICENSE.txt
 */
(function (scope, empty) {
    var DONE = Object.freeze({done:true});

    var wrappers = [
        function(val) {
            if (Array.isArray(val)) return array(val);
        },
        function(val) {
            return single(val);
        }
    ];

    function wrap(val) {
        var next = val && val.next;
        if (typeof next === 'function') {
            return val;
        } else {
            var idx = 0, len = wrappers.length, iter;
            while (idx < len) if ((iter = wrappers[idx++](val))) return iter;
            return {next: function() { return DONE; }};
        }
    }

    function single(val) {
        var next = 1;
        return {
            next: function() {
                if (next--) return {value: val};
                return DONE;
            }
        }
    }

    function array(val, start, count, step) {
        var len = val.length, temp;

        var inc = typeof step === 'number' ? step : 1,
            cnt = typeof count === 'number' ? count : -1,
            idx = typeof start === 'number' ? start : 0;

        cnt = cnt > -1 ? cnt : len;
        idx = idx < 0 ? len - idx - 1 : idx;

        return {
            next: function() {
                if (--cnt < 0 || idx < 0 || idx >= len) return DONE;
                return temp = val[idx], idx += inc, {value: temp}
            }
        }
    }

    function filter(iter, fn) {
        return {
            next: function() {
                var next = iter.next();
                if (next.done) return DONE;
                if (fn(next.value)) return next;
                return DONE;
            }
        }
    }

    function take(iter, countOrFn) {
        var count = 0;
        return {
            next: typeof countOrFn === 'function' ? function() {
                var next = iter.next();
                if (next.done) return DONE;
                if (countOrFn(next.value)) return next;
                return DONE;
            } : function() {
                var next = iter.next();
                if (next.done) return DONE;
                if (count++ < countOrFn) return next;
                return DONE;
            }
        }
    }

    function skip(iter, countOrFn) {
        var count = 0;
        return {
            next: typeof countOrFn === 'function' ? function() {
                var next;
                if (count <= 0) while (!(count++, next = iter.next()).done && countOrFn(next.value));
                if (next.done) return DONE;
                return next;
            } : function() {
                var next;
                if (count <= 0) while (!(count++, next = iter.next()).done && count < countOrFn);
                if (next.done) return DONE;
                return next;
            }
        }
    }

    function peek(iter, fn) {
        return map(iter, function(val) {
            fn(val);
            return val;
        })
    }

    function map(iter, fn) {
        return {
            next: function() {
                var next = iter.next();
                if (next.done) return DONE;
                return {value: fn(next.value)};
            }
        }
    }

    function mapMany(iter, fn) {
        var exp, temp, next;
        return {
            next: function() {
                while (!exp || (next = exp.next()).done) {
                    temp = iter.next();
                    if (temp.done) return DONE;
                    exp = wrap(temp.value);
                }
                if (next.done) return DONE;
                return {value: fn(next.value)};
            }
        }
    }

    function reduce(iter, val, fn) {
        var next, out = val;
        while (!(next = iter.next()).done) {
            out = fn(out, next.value);
        }
        return out;
    }

    function reverse(iter) {
        var exp;
        return {
            next: function() {
                if (!exp) exp = array(reduce(iter, [], function(arr, val) {
                    return arr.push(val), arr;
                }), -1, -1, -1);
                return exp.next();
            }
        }
    }

    function truthy(val) {
        return !!val;
    }

    function falsy(val) {
        return !val;
    }

    function Enumerable(val) {
        if (!(this instanceof Enumerable)) return new Enumerable(val);

        this.iter = wrap(val);
    }

    Enumerable.prototype.filter = function(fn) {
        return this.iter = filter(this.iter, fn), this;
    }

    Enumerable.prototype.map = function(fn) {
        return this.iter = map(this.iter, fn), this;
    }

    Enumerable.prototype.mapMany = function(fn) {
        return this.iter = mapMany(this.iter, fn), this;
    }

    Enumerable.prototype.peek = function(fn) {
        return this.iter = peek(this.iter, fn), this;
    }

    Enumerable.prototype.reverse = function() {
        return this.iter = reverse(this.iter), this;
    }

    Enumerable.prototype.first = function(def) {
        var next = this.iter.next();
        if (next.done) return def instanceof Enumerable ? def.first() : def;
        return next.value;
    }

    Enumerable.prototype.last = function(def) {
        var iter = this.iter, last, next;
        while (!(last = next, next = iter.next()).done);
        if (last) return last.value;
        return def instanceof Enumerable ? def.last() : def;
    }

    Enumerable.prototype.reduce = function(val, fn) {
        return reduce(this.iter, val, fn);
    }

    Enumerable.prototype.toArray = function() {
        return this.reduce([], function(arr, val) {
            return arr.push(val), arr;
        });
    }

    Enumerable.prototype.toObject = function(keyFn, valFn) {
        return this.reduce({}, function(obj, val) {
            return obj[keyFn(val)] = valFn ? valFn(val) : val, obj;
        });
    }

    Enumerable.prototype.some = function(fn) {
        var iter = filter(this.iter, fn || truthy),
            next = iter.next();
        return !next.done;
    }

    Enumerable.prototype.every = function(fn) {
        var iter = this.iter, next, check = fn || truthy;
        while (!(next = iter.next()).done) if (!check(next.value)) return false;
        return true;
    }

    Enumerable.prototype.none = function(fn) {
        var iter = filter(this.iter, fn || falsy),
            next = iter.next();
        return next.done;
    }

    Enumerable.wrappers = wrappers;

    if (typeof module != 'undefined' && module.exports) {
        module.exports = Enumerable;
    } else if (typeof define == 'function' && typeof define.amd == 'object') {
        define(function() { return Enumerable; });
    } else {
        scope.Enumerable = Enumerable;
    }
})(this);
