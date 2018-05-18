// require modules
var fs = require('fs');
var archiver = require('archiver');

/**
 * Creates a zip of the src folder at zipPath 
 */
const zipFolder = (src, zipPath, onComplete) => {
  // create a file to stream archive data to.
  var output = fs.createWriteStream(zipPath);
  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    onComplete();
  });
  
  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function() {
    console.log('Data has been drained');
  });
  
  // Catch errors and warnings
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.log(err);
    } else {
      throw err;
    }
  });
  
  archive.on('error', function(err) {
    throw err;
  });
  
  // pipe archive data to the zip file
  archive.pipe(output);

  // append files from the src folder
  archive.glob(src + "/**/*");

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  archive.finalize();
}

module.exports = zipFolder;