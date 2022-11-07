'use strict';

var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var streamBuffers = require("stream-buffers");
var unzip = require('../');

test("get content of a single file entry out of a zip", function (t) {
  var archive = path.join(__dirname, '../testData/compressed-standard/archive.zip');

  fs.createReadStream(archive)
    .pipe(unzip.Parse())
    .on('entry', function(entry) {
      if (entry.path !== 'file.txt')
        return entry.autodrain();

      entry.buffer()
        .then(function(str) {
          var fileStr = fs.readFileSync(path.join(__dirname, '../testData/compressed-standard/inflated/file.txt'), 'utf8');
          t.equal(str.toString(), fileStr);
          t.end();
        });
    });

test("Signature error should be raised for a bad archive with 8 extra bytes", function (t) {
  var archive = path.join(__dirname, '../testData/compressed-standard/archive-extra-8-bytes.zip');

  fs.createReadStream(archive)
    .pipe(unzip.Parse())
    .on('entry', function(entry) {
        return entry.autodrain();
    })
    .promise()
    .catch(function(e) {
      t.same(e.message, 'invalid signature: 0x0');
      t.end();
    });
  });

test("Use byte skipping to get content of a single file entry out of a zip with 8 extra bytes", function (t) {
  var archive = path.join(__dirname, '../testData/compressed-standard/archive-extra-8-bytes.zip');

  fs.createReadStream(archive)
    .pipe(unzip.Parse({allowedSkips: 4}))
    .on('entry', function(entry) {
      if (entry.path !== 'file.txt')
        return entry.autodrain();

      entry.buffer()
        .then(function(str) {
          var fileStr = fs.readFileSync(path.join(__dirname, '../testData/compressed-standard/inflated/file.txt'), 'utf8');
          t.equal(str.toString(), fileStr);
          t.end();
        });
    });
  });
});