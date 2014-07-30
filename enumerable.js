/*!
 * enumerable-js v2.0
 * Copyright 2014, Michael Morton
 *
 * MIT Licensed - See LICENSE.txt
 */
//noinspection ThisExpressionReferencesGlobalObjectJS
(function (scope, empty) {
    function iterable(value) {
        return value && typeof value.current == 'function' && typeof value.reset == 'function' && typeof value.prev == 'function' && typeof value.next == 'function';
    }

    function mix(a, b) {
        var o = {}, p;
        a = a.prototype || a;
        b = b.prototype || b;
        for (p in a) o[p] = a[p];
        for (p in b) o[p] = b[p];
        return o;
    }

    function wrap(value) {
        if (iterable(value)) return value;

        return new IndexIterator(value && (value.hasOwnProperty('length') ? value : [value]) || []);
    }

    function Iterator(up) {
        this.up = up;
    }

    Iterator.prototype = {
        current: function () { return this.up.current(); },
        next: function () { return this.up.next(); },
        prev: function () { return this.up.prev(); },
        reset: function (end) { return this.up.reset(end); }
    };


    function IndexIterator(value) {
        this.value = value;
        this.index = -1;
    }

    IndexIterator.prototype = {
        current: function () { return this.value[this.index]; },
        next: function () { return ++this.index < this.value.length; },
        prev: function () { return --this.index > -1; },
        reset: function (end) { return this.index = end ? this.value.length : -1, true; }
    };

    function FilterIterator(up, predicate) {
        this.up = up;
        this.predicate = predicate;
    }

    FilterIterator.prototype = mix(Iterator, {
        next: function () {
            while (this.up.next())
                if (this.predicate(this.up.current()))
                    return true;
            return false;
        },
        prev: function () {
            while (this.up.prev())
                if (this.predicate(this.up.current()))
                    return true;
            return false;
        }
    });

    function MapIterator(up, block) {
        this.up = up;
        this.block = block;
    }

    MapIterator.prototype = mix(Iterator, {
        current: function () {
            return this.block(this.up.current());
        }
    });

    function MapManyIterator(up, block) {
        this.up = up;
        this.block = block;
        this.expanded = false;
    }

    MapManyIterator.prototype = mix(Iterator, {
        current: function () {
            return this.expanded.current();
        },
        next: function () {
            while (!this.expanded || !this.expanded.next())
            {
                if (!this.up.next())
                    return false;

                this.expanded = wrap(this.block(this.up.current()));

                if (!this.expanded.reset())
                    return false;
            }

            return true;
        },
        prev: function () {
            while (!this.expanded || !this.expanded.prev())
            {
                if (!this.up.prev())
                    return false;

                this.expanded = wrap(this.block(this.up.current()));

                if (!this.expanded.reset(true))
                    return false;
            }

            return true;
        },
        reset: function (end) {
            this.expanded = false;
            return this.up.reset(end);
        }
    });

    function ReverseIterator(up) {
        this.up = up;
    }

    ReverseIterator.prototype = mix(Iterator, {
        next: function () { return this.up.prev(); },
        prev: function () { return this.up.next(); },
        reset: function (end) { return this.up.reset(!end); }
    });

    function Enumerable(value) {
        if (!(this instanceof Enumerable)) return new Enumerable(value);

        this.iterator = wrap(value);
    }

    Enumerable.prototype = {
        first: function (def) {
            if (this.iterator.reset() && this.iterator.next()) return this.iterator.current();
            else return def;
        },
        last: function (def) {
            if (this.iterator.reset(true) && this.iterator.prev()) return this.iterator.current();
            else return def;
        },
        filter: function (predicate) {
            this.iterator = new FilterIterator(this.iterator, predicate);
            return this;
        },
        map: function (block) {
            this.iterator = new MapIterator(this.iterator, block);
            return this;
        },
        mapMany: function (block) {
            this.iterator = new MapManyIterator(this.iterator, block);
            return this;
        },
        reverse: function() {
            this.iterator = new ReverseIterator(this.iterator);
            return this;
        },
        reduce: function (initial, block) {
            this.iterator.reset();

            var value = initial;

            while (this.iterator.next()) value = block(value, this.iterator.current());

            return value;
        },
        each: function(block) {
            this.iterator.reset();

            while (this.iterator.next()) block(this.iterator.current());

            return this;
        },
        some: function(predicate) {
            this.iterator.reset();

            predicate = predicate || function(item) { return !!item; };

            var check = new FilterIterator(this.iterator, predicate);

            return check.next();
        },
        none: function(predicate) {
            this.iterator.reset();

            predicate = predicate || function(item) { return !item; };

            var check = new FilterIterator(this.iterator, predicate);

            return !check.next();
        },
        every: function(predicate) {
            this.iterator.reset();

            while (this.iterator.next()) if (!predicate(this.iterator.current())) return false;

            return true;
        },
        toArray: function () {
            this.iterator.reset();

            var value = [];

            while (this.iterator.next()) value.push(this.iterator.current());

            return value;
        },
        toDictionary: function (keySelector, valueSelector) {
            return this.reduce({}, function (d, o) {
                d[keySelector(o)] = valueSelector ? valueSelector(o) : o;
                return d;
            });
        },
        introspect: function(block) {
            block(this);
            return this;
        }
    };

    //noinspection JSUnresolvedVariable
    if (typeof module != 'undefined' && module.exports)
    {
        //noinspection JSUnresolvedVariable
        module.exports = Enumerable;
    }
    else if (typeof define == 'function' && typeof define.amd == 'object')
    {
        //noinspection JSValidateTypes
        define(function() { return Enumerable; });
    }
    else
    {
        scope.Enumerable = Enumerable;
    }
})(this);
