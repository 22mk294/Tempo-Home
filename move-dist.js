// This script will build the React frontend and move the build output to the root 'dist' directory for the backend to serve.
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const srcDist = path.join(__dirname, 'src', 'dist');
const rootDist = path.join(__dirname, 'dist');

if (fs.existsSync(srcDist)) {
  fse.removeSync(rootDist);
  fse.copySync(srcDist, rootDist);
  console.log('Moved src/dist to root dist/');
} else {
  console.error('src/dist does not exist. Did you run vite build?');
  process.exit(1);
}
