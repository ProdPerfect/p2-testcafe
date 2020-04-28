# gulp-step

The plugin for defining internal build steps for the Gulp@next. Allows to create tasks that aren't visible for the Gulp CLI.

Example of a `Gulpfile.js`:

```js
// Require Gulp
const gulp = require('gulp');

// Require the module
const gulpStep = require('gulp-step'); 

// Install the module into a Gulp object
gulpStep.install(); 

// Use gulp.step to define build steps. Steps are similar to Gulp tasks, but can't be 
// started directly from the Gulp CLI
gulp.step('a', done => { 
    console.log('a');
    
    done();
});

gulp.task('b', done => {
    console.log('b');
    
    done();
});

// $ gulp --task-simple
//    b
//
// WRONG:   $ gulp a
// CORRECT: $ gulp b

// Step names can be used exactly in the same way as task names in gulp.series and gulp.parallel 
gulp.step('c', gulp.series('a', 'b'));

gulp.task('d', gulp.parallel('a', 'b')); 
```
