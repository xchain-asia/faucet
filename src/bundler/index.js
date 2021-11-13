const fs = require('fs')
const path = require('path')
const browserify = require('browserify')
const lavamoat = require('lavamoat-browserify')
const envify = require('envify/custom')
const { address } = require('../server/get-config')

const srcDir = path.join(__dirname, '..', 'webapp')
const htmlPath = path.join(srcDir, 'index.html')
const entryPath = path.join(srcDir, 'index.js')
const stylePath = path.join(srcDir, 'style.css')
const faviconPath = path.join(srcDir, 'favicon.ico')
const assetsDir = path.join(srcDir, 'assets')
const buildDir = path.join(__dirname, '..', '..', 'build', )
const destPath = path.join(buildDir, 'app.js')

// prepare app bundle
const bundler = browserify(lavamoat.args)

function copyFileSync( source, target ) {
  var targetFile = target;
  if ( fs.existsSync( target ) ) {
      if ( fs.lstatSync( target ).isDirectory() ) {
          targetFile = path.join( target, path.basename( source ) );
      }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  var files = [];
  var targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
      fs.mkdirSync( targetFolder );
  }
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
        var curSource = path.join( source, file );
        if ( fs.lstatSync( curSource ).isDirectory() ) {
            copyFolderRecursiveSync( curSource, targetFolder );
        } else {
            copyFileSync( curSource, targetFolder );
        }
    } );
  }
}

// inject faucet address
bundler.transform(envify({
  FAUCET_ADDRESS: address
}))

// add lavamoat protections
const policyDir = path.join(srcDir, 'lavamoat', 'browserify')
bundler.plugin(lavamoat, {
  policy: path.join(policyDir, 'policy.json'),
  policyOverride: path.join(policyDir, 'policy-override.json'),
})

// add app entry
bundler.add(entryPath)

// ensure dest dir exists
fs.mkdirSync(buildDir, { recursive: true })

// copy html file over
fs.copyFileSync(htmlPath, path.join(buildDir, 'index.html'))
fs.copyFileSync(stylePath, path.join(buildDir, 'style.css'))
fs.copyFileSync(faviconPath, path.join(buildDir, 'favicon.ico'))
copyFolderRecursiveSync(assetsDir, buildDir)

// build app
bundler.bundle()
  .pipe(fs.createWriteStream(destPath))
