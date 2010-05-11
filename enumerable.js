/*!
 * enumerable-js v.10 
 * Copyright 2010, Michael Morton 
 * 
 * MIT Licensed - See LICENSE.txt
 */
(function () {
    var supportsIteration = function (o) {
        return typeof o.current === 'function' &&
			   typeof o.next === 'function' &&
			   typeof o.prev === 'function' &&
			   typeof o.reset === 'function';
    };
    var mix = function (a, b, c) {
        if (typeof c === 'undefined')
        {
            c = b;
            b = a;
            a = {};
        }

        b = b.prototype || b;

        if (b) for (var n in b) a[n] = b[n];
        if (c) for (var n in c) a[n] = c[n];

        return a;
    };
    var wrap = function(o) {
        if (typeof o == 'undefined') 
            return [];

        if (supportsIteration(o))
            return o;

        // todo: fix, not correct
        if (o.hasOwnProperty('length'))
            return new ArrayIterator(o);

        return new ArrayIterator([o]);
    };

    var Iterator = function (up) {
        this.up = up;
    };

    Iterator.prototype = {
        current: function () { return this.up.current(); },
        next: function () { return this.up.next(); },
        prev: function () { return this.up.prev(); },
        reset: function (end) { return this.up.reset(end); }
    };

    var ArrayIterator = function (items) {
        this.items = items;
        this.pos = -1;
    };

    ArrayIterator.prototype = {
        current: function () {
            return this.items[this.pos];
        },
        next: function () {
            return ++this.pos < this.items.length;
        },
        prev: function () {
            return --this.pos > -1;
        },
        reset: function (end) {
            this.pos = end ? this.items.length : -1;
            return true;
        }
    };

    var PredicateIterator = function (up, predicate) {
        this.up = up;
        this.predicate = predicate;
    };

    PredicateIterator.prototype = mix(Iterator, {
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

    var BlockIterator = function (up, block) {
        this.up = up;
        this.block = block;
    };

    BlockIterator.prototype = mix(Iterator, {
        current: function () {
            return this.block(this.up.current());
        }
    });

    var ExpandingIterator = function (up, block) {
        this.up = up;
        this.block = block;
        this.expanded = false;
    };

    ExpandingIterator.prototype = mix(Iterator, {
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

    var ReverseIterator = function(up) {
        this.up = up;
    };

    ReverseIterator.prototype = mix(Iterator, {        
        next: function () { return this.up.prev(); },
        prev: function () { return this.up.next(); },
        reset: function (end) { return this.up.reset(!end); }
    });

    Enumerable = window.Enumerable = function (source) {
        this.iterator = wrap(source);
    };

    Enumerable.prototype = {
        first: function (def) {
            if (this.iterator.reset() && this.iterator.next())
                return this.iterator.current();
            else if (typeof def !== 'undefined')
                return def;
        },
        last: function (def) {
            if (this.iterator.reset(true) && this.iterator.prev())
                return this.iterator.current();
            else if (typeof def !== 'undefined')
                return def;
        },
        where: function (predicate) {
            this.iterator = new PredicateIterator(this.iterator, predicate);
            return this;
        },
        select: function (block) {
            this.iterator = new BlockIterator(this.iterator, block);
            return this;
        },
        selectMany: function (block) {
            this.iterator = new ExpandingIterator(this.iterator, block);
            return this;
        },
        reverse: function() {
            this.iterator = new ReverseIterator(this.iterator);
            return this;
        },
        aggregate: function (initial, block) {
            var result = initial;

            this.iterator.reset();

            while (this.iterator.next())
                result = block(result, this.iterator.current());

            return result;
        },
        each: function(block) {
            this.iterator.reset();

            while (this.iterator.next())
                block(this.iterator.current());

            return this;
        },
        toArray: function () {
            var result = [];

            this.iterator.reset();

            while (this.iterator.next())
                result.push(this.iterator.current());

            return result;
        },
        toDictionary: function (keySelector, valueSelector) {
            return this.aggregate({}, function (d, o) {
                d[keySelector(o)] = valueSelector ? valueSelector(o) : o;
                return d;
            });
        },
        inspect: function(block) {
            block(this);
            return this;
        }       
    };
})();