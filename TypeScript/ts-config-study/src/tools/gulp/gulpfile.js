var gulp = require("gulp");
var ts = require("gulp-typescript");

gulp.task("default", function () {
  gulp.src("src/index.ts").pipe(ts()).pipe(gulp.dest("./"));
});
