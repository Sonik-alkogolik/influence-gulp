import gulp from 'gulp';
import del from 'del';
import sassLib from 'sass';  // Импортируем компилятор sass
import gulpSass from 'gulp-sass';  // Импортируем gulp-sass
import autoprefixer from 'gulp-autoprefixer'; 
import postcss from 'gulp-postcss'; 
import combineMediaQueries from 'postcss-combine-media-query';
import sortMediaQueries from 'postcss-sort-media-queries';
import replace from 'gulp-replace';
import fileInclude from 'gulp-file-include';
import concat from 'gulp-concat';
import browserSync from 'browser-sync';

const sass = gulpSass(sassLib);  // Передаем компилятор в gulp-sass
const { create } = browserSync;
const browserSyncInstance = create();

// Функция для очистки папки dist
function clean() {
    return del('dist');
}

// Функция для обработки HTML файлов
function gohtml() {
    return gulp.src('dev/html/index.html') 
      .pipe(fileInclude({
        prefix: '@@',    
        basepath: '@file'   
      }))
      .pipe(replace('/dist/', '/'))
      .pipe(gulp.dest('dist'));
}

// Функция для обработки SCSS файлов
function scssstyle() {
    return gulp.src('dev/style/style.scss') 
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([combineMediaQueries(), sortMediaQueries()]))
        .pipe(autoprefixer())  // Добавляем префиксы
        .pipe(concat('style.css'))  // Собираем все CSS в один файл
        .pipe(gulp.dest('dist/'))
        .pipe(browserSyncInstance.stream());
}

// Функция для обработки JavaScript файлов
function script() {
    return gulp.src('dev/js/*.js')
    .pipe(gulp.dest('dist/'));
}

// Задача для копирования изображений
// function images() {
//     return gulp.src('dev/img/**/*')  // Все файлы из dev/img
//         .pipe(gulp.dest('dist/img'));  // Копируем в dist/img
// }

// Функция для запуска сервера
function watch() {
    browserSyncInstance.init({
        server: { baseDir: "dist" }
    });

    gulp.watch(["dev/html/**/*.html", "dev/style/**/*.scss", "dev/style/**/*.css"], gulp.series(gohtml,scssstyle));
    gulp.watch("dist/*.html").on('change', browserSyncInstance.reload);
    gulp.watch("dev/js/**/*.js", gulp.series(script)); 
    // gulp.watch("dev/img/**/*", gulp.series(images)); 
}

// Экспортируем задачу по умолчанию
export default gulp.series(clean, gohtml, scssstyle, script, watch);
