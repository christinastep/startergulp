//tutorial
//https://medium.com/swlh/setting-up-gulp-4-0-2-for-bootstrap-sass-and-browsersync-7917f5f5d2c5
//https://css-tricks.com/gulp-for-beginners/


const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();


//svg gif ->cherche mieux
var imagemin = require('gulp-imagemin');
var $ = require('gulp-load-plugins')()

//1x 2x > compress
var responsive = require('gulp-responsive')
var cache = require('gulp-cache');

//Cleaning up generated files automatically
var del = require('del');

//Optimizing CSS and JavaScript files
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
const babel = require('gulp-babel');

const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

var runSequence = require('run-sequence');
var realFavicon = require ('gulp-real-favicon');

//favicon
var fs = require('fs');
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';



//function style() {
gulp.task('style', function() {
  return gulp.src('app/scss/**/*.scss')
  .pipe(sass().on('error',sass.logError))
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.stream());
})


//function scripts() {
gulp.task('scripts', function() {
  return gulp.src('app/js/**/*.js')
  //.pipe(sass().on('error',sass.logError))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());
})
//function html() {
gulp.task('html', function() {
  return gulp.src('app/*.html')
  //.pipe(sass().on('error',sass.logError))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream());
})





/**OptimizeCss
 * gulp optimizeCss (autofixer)
 */

gulp.task('optimizeCss', function() {
  return gulp.src('dist/css/**/*.css')
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 99 versions'],
        cascade: false}))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('cleanCssFolder', function(cb) {
  del(['dist/css/**/*', '!dist/css/styles.css'], cb);
});


gulp.task('productionCss', gulp.series(
  'optimizeCss',
  //'cleanCssFolder'
));
/** End OptimizeCss */




/**OptimizeJs
 * gulp optimizeJs (concat all js files, uglify)
 */

gulp.task('compileJs', function () {
  return gulp.src('dist/js/**/*.js')
    .pipe(babel({
			presets: ['@babel/preset-env']
    }))  
    .pipe(gulp.dest('dist/js'))
});

gulp.task('minifyJs', function () {
  return gulp.src('dist/*.html')
  .pipe(gulpIf('*.js', uglify()))
  .pipe(useref())
  .pipe(gulp.dest('dist'))
})

gulp.task('cleanJsFolder', function(cb) {
  del(['dist/js/**/*', '!dist/js/main.min.js'], cb);
});


gulp.task('productionJs', gulp.series(
  'html',
  //'cleanJsFolder',
  'compileJs',
  'minifyJs'
  
));
/** End OptimizeJs */




/**AddFonts
 * gulp addFonts (if you add un font ) -> dist/fonts
 */
gulp.task('addFonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})
/** End AddFonts */


/**AddImages
 * gulp addImages (if you add un images ) -> dist/images
 */

//resize (png, jpg)
gulp.task('resizeImages', function(){
  return gulp.src('app/images/pixelImages/*.+(png|jpg)')
    .pipe(
      responsive({
        '*': [
          {
            width: '100%',
            rename: {
              suffix: '@2x'
            },
          },
          {
            width: '50%',
            rename: {
              suffix: '@1x'
            },
          }
        ]
      },{
        // Global configuration for all images
        // The output quality for JPEG, WebP and TIFF output formats
        quality: 100,
        // Use progressive (interlace) scan for JPEG and PNG output
        progressive: false,
        // Zlib compression level of PNG output format
        compressionLevel: 0,
        // Strip all metadata
        withMetadata: true
      })
    )
  .pipe(gulp.dest('dist/images/pixelImages'))
});


//remove viewbox (svg)
gulp.task('compressIcon', function(){
  return gulp.src('app/images/icon/*.+(svg)')
  .pipe(imagemin([
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ]))
  .pipe(gulp.dest('dist/images/icon'))
})

gulp.task('addImages', gulp.series(
  'resizeImages',
  'compressIcon',
));
/** End AddImages */

/**addFavicon
 * gulp addFavicon ( generate Favicon files )
 */
gulp.task('addFavicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'app/favicon.png',
		dest: 'dist/favicon',
		iconsPath: '/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {
				design: 'raw'
			},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			}
		},
		settings: {
			scalingAlgorithm: 'on',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});
/** end addFavicon */


/**AddAssets
 * gulp addAssets (if you want to add images and fonts at once )
 */
gulp.task('addAssets', gulp.series(
  'addImages',
  'addFonts',
  'addFavicon'
));
/** End AddFonts */



/**compressImages
 * gulp compressImages ( compresss )
 */
gulp.task('compressImages', function(){
  return gulp.src('dist/images/pixelImages/**/*.+(jpg|png)')
  .pipe(imagemin([
    imagemin.mozjpeg({quality: 90, progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
  ]))
  .pipe(gulp.dest('dist/images/pixelImages'))
})
/** end compressdImages */





gulp.task('clean:dist', function() {
  return del('dist');
})



// Inject the favicon markups in your HTML pages
gulp.task('inject-favicon-markups', function() {
	return gulp.src(['app/*.html'])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('app'));
});

// Check for updates on RealFaviconGenerator
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

gulp.task('start', gulp.series(
  //'clean:dist',
  'html',
  'style',
  'scripts',
  'optimizeCss',
  'addAssets',
  //'optimizeJs',
  'compressImages'
));

gulp.task('build', gulp.series(
  'optimizeCss',
  'productionJs',
  'compressImages'
));





//Watch

gulp.task('watchFiles', function(){
  browserSync.init(['./app/**/**.**'],{
    injectChanges: true,
      server: {
          baseDir: "./dist",
          index: "/index.html"
      }
  });
  gulp.watch('app/scss/**/*.scss', gulp.series('style')),
  gulp.watch('app/js/**/*.js', gulp.series('scripts')),
  gulp.watch('app/*.html', gulp.series('html'));
return
});


gulp.task('watch', gulp.series(
  //force reload to get links
  'html', 
  'style',
  'scripts',
  'watchFiles'
));










