module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['requirejs', 'jasmine'],
        plugins: [
            require('karma-requirejs'),
            require('karma-jasmine'),
            require('karma-script-launcher'),
            require('karma-chrome-launcher'),
            require('karma-sourcemap-loader'),
            require('karma-typescript-preprocessor2')
        ],
        files: [
            //{pattern: './src/kernel/turbo/xray-kernel-turbo.ts', watched: true},
            {pattern: './src/kernel/turbo/xray-kernel-turbo.spec.ts', watched: true}
        ],
        preprocessors: {
            'src/kernel/turbo/*.ts': ['typescript', 'sourcemap']   // Use karma-sourcemap-loader
        },
        typescriptPreprocessor: {
            // options passed to typescript compiler
            tsconfigPath: './src/kernel/turbo/tsconfig.json', // *obligatory
            compilerOptions: { // *optional
                removeComments: false
            },
            // Options passed to gulp-sourcemaps to create sourcemaps
            sourcemapOptions: {includeContent: true, sourceRoot: '/src'},
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
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeCanary_SAB'],
        customLaunchers: {
            ChromeCanary_SAB: {
                base: 'Chrome'
                //flags: ['--js-flags="--harmony-sharedarraybuffer"']
            }
        },
        singleRun: false
    });
};