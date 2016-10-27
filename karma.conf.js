module.exports = function (config) {
    config.set({
        basePath: './src/kernel/turbo/',
        frameworks: ['commonjs', 'jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-sourcemap-loader'),
            require('karma-typescript'),
            require('karma-commonjs'),
            require('karma-coverage')
        ],
        files: [
            {pattern: 'turbo-runtime.js', watched: true},
            {pattern: 'xray-kernel-turbo.ts', watched: true},
            {pattern: 'xray-kernel-turbo.spec.ts', watched: true}
        ],
        preprocessors: {
            '**/*.ts': ["karma-typescript", "commonjs", "coverage"]   // Use karma-sourcemap-loader
        },
        /*typescriptPreprocessor: {
            // options passed to typescript compiler
            tsconfigPath: 'tsconfig.json', // *obligatory
            compilerOptions: { // *optional
                removeComments: false
            },
            // Options passed to gulp-sourcemaps to create sourcemaps
            sourcemapOptions: {includeContent: true, sourceRoot: ''},
            // ignore all files that ends with .d.ts (this files will not be served)
            ignorePath: function(path){
                return /\.d\.ts$/.test(path);
            },
            // transforming the filenames
            // you can pass more than one, they will be execute in order
            transformPath: [function(path) { // *optional
                return path.replace(/\.ts$/, '.js');
            }, function(path) {
                return path.replace(/[\/\\]test[\/\\]/i, '/'); // remove directory test and change to /
            }]
        },*/
        reporters: ["dots", "karma-typescript", "coverage"],
        coverageReporter: {type : 'html', dir : 'coverage/'},
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome_SAB'],
        customLaunchers: {
            Chrome_SAB: {
                base: 'Chrome',
                flags: ['--js-flags="--harmony-sharedarraybuffer"']
            },
            ChromeCanary_SAB: {
                base: 'ChromeCanary',
                flags: ['--js-flags="--harmony-sharedarraybuffer"']
            }
        },
        singleRun: false
    });
};