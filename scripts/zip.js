import fs from 'fs';
import child_process from 'child_process';

import archiver from 'archiver';

// Constants
const BUILD_DIR = 'build';

// Get latest tag from git
const tag = child_process.execSync('git describe --tags --abbrev=0').toString().trim();

// Create a file to stream archive data to
const output = fs.createWriteStream(
    `cosmere-rpg-${tag}.zip`
);

// Create a new archive
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

// pipe archive data to the file
archive.pipe(output);

// Add files to the archive
archive.directory(BUILD_DIR, false);

// Finalize the archive
archive.finalize();