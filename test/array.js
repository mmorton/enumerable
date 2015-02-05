var assert = require('assert'),
    enumerable = require('../enumerable');

describe('enumerable using array', function() {
    it('first', function() {
        var value = enumerable([1,2,3,4,5]).first();
        assert.equal(value, 1, 'first item should be 1');
    });

    it('last', function() {
          var value = enumerable([1,2,3,4,5]).last();
          assert.equal(value, 5, 'last item should be 5');
    });

    it('every (all)', function() {
          var value = enumerable([1,2,3,4,5]).every(function(v) { return v <= 5; });
          assert.equal(value, true, 'all items are <= 5');
    });

    it('every (some)', function() {
          var value = enumerable([1,2,3,4,5]).every(function(v) { return v < 5; });
          assert.equal(value, false, 'some items are not < 5');
    });

    it('every (none)', function() {
          var value = enumerable([1,2,3,4,5]).every(function(v) { return v > 5; });
          assert.equal(value, false, 'no items are > 5');
    });

    it('some (some)', function() {
          var value = enumerable([1,2,3,4,5]).some(function(v) { return v < 5; });
          assert.equal(value, true, 'some items are < 5');
    });

    it('some (none)', function() {
          var value = enumerable([1,2,3,4,5]).some(function(v) { return v > 5; });
          assert.equal(value, false, 'no items are > 5');
    });

    it('take (fn)', function() {
          var value = enumerable([1,2,3,4,5]).take(function(v) { return v < 3;  }).toArray();
          assert.deepEqual(value, [1,2], 'under 3')
    });

    it('take (count)', function() {
          var value = enumerable([1,2,3,4,5]).take(3).toArray();
          assert.deepEqual(value, [1,2,3], '3')
    });

    it('skip (fn)', function() {
        var value = enumerable([1,2,3,4,5]).skip(function(v) { return v < 3;  }).toArray();
        assert.deepEqual(value, [3,4,5], '3 and over')
    })

    it('skip (count)', function() {
          var value = enumerable([1,2,3,4,5]).skip(4).toArray();
          assert.deepEqual(value, [5], '5')
    });

    it('map', function() {
          var value = enumerable([1,2,3,4,5]).map(function(v) { return v * 2; }).toArray();
          assert.deepEqual(value, [2,4,6,8,10], 'v * 2');
    });

    it('mapMany', function() {
          var value = enumerable([1,[2,3],[4,5]]).mapMany(function(v) { return v; }).toArray();
          assert.deepEqual(value, [1,2,3,4,5], 'flatten');
    });

    it('toArray', function() {
          var value = enumerable([1,2,3,4,5]).toArray();
          assert.deepEqual(value, [1,2,3,4,5], 'direct');
    });

    it('toDictionary (key)', function() {
          var value = enumerable([1,2,3,4,5]).toObject(function(v) { return 'key' + v; });
          assert.deepEqual(value, {'key1':1,'key2':2,'key3':3,'key4':4,'key5':5}, 'key map');
    });

    it('filter (all)', function() {
          var value = enumerable([1,2,3,4,5]).filter(function(v) { return v <= 5; }).toArray();
          assert.deepEqual(value, [1,2,3,4,5], 'all items are <= 5');
    });

    it('filter (some)', function() {
          var value = enumerable([1,2,3,4,5]).filter(function(v) { return v < 5; }).toArray();
          assert.deepEqual(value, [1,2,3,4], 'some items are < 5');
    });

    it('filter (none)', function() {
          var value = enumerable([1,2,3,4,5]).filter(function(v) { return v > 5; }).toArray();
          assert.deepEqual(value, [], 'no items are > 5');
    });

    it('reverse', function() {
          var value = enumerable([1,2,3,4,5]).reverse().toArray();
          assert.deepEqual(value, [5,4,3,2,1], 'reversed');
    });
});
