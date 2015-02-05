(function() {

  QUnit.test('first', function(assert) {
      var value = Enumerable([1,2,3,4,5]).first();
      assert.equal(value, 1, 'first item should be 1');
  });

  QUnit.test('last', function(assert) {
      var value = Enumerable([1,2,3,4,5]).last();
      assert.equal(value, 5, 'last item should be 5');
  });

  QUnit.test('every (all)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).every(function(v) { return v <= 5; });
      assert.equal(value, true, 'all items are <= 5');
  });

  QUnit.test('every (some)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).every(function(v) { return v < 5; });
      assert.equal(value, false, 'some items are not < 5');
  });

  QUnit.test('every (none)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).every(function(v) { return v > 5; });
      assert.equal(value, false, 'no items are > 5');
  });

  QUnit.test('some (some)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).some(function(v) { return v < 5; });
      assert.equal(value, true, 'some items are < 5');
  });

  QUnit.test('some (none)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).some(function(v) { return v > 5; });
      assert.equal(value, false, 'no items are > 5');
  });

  QUnit.test('map', function(assert) {
      var value = Enumerable([1,2,3,4,5]).map(function(v) { return v * 2; }).toArray();
      assert.deepEqual(value, [2,4,6,8,10], 'v * 2');
  });

  QUnit.test('mapMany', function(assert) {
      var value = Enumerable([1,[2,3],[4,5]]).map(function(v) { return v; }).toArray();
      assert.deepEqual(value, [1,2,3,4,5], 'flat');
  });

  QUnit.test('toArray', function(assert) {
      var value = Enumerable([1,2,3,4,5]).toArray();
      assert.deepEqual(value, [1,2,3,4,5], 'direct');
  });

  QUnit.test('toDictionary (key)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).toObject(function(v) { return 'key' + v; });
      assert.deepEqual(value, {'key1':1,'key2':2,'key3':3,'key4':4,'key5':5}, 'key map');
  });

  QUnit.test('filter (all)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).filter(function(v) { return v <= 5; }).toArray();
      assert.deepEqual(value, [1,2,3,4,5], 'all items are <= 5');
  });

  QUnit.test('filter (some)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).filter(function(v) { return v < 5; }).toArray();
      assert.deepEqual(value, [1,2,3,4], 'some items are < 5');
  });

  QUnit.test('filter (none)', function(assert) {
      var value = Enumerable([1,2,3,4,5]).filter(function(v) { return v > 5; }).toArray();
      assert.deepEqual(value, [], 'no items are > 5');
  });

  QUnit.test('reverse', function(assert) {
      var value = Enumerable([1,2,3,4,5]).reverse().toArray();
      assert.deepEqual(value, [5,4,3,2,1], 'reversed');
  });

})();
