module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bumpup: {
            files: ['package.json']
        },
        jasmine_nodejs: {
            options: {
                forceExit: false,
                specNameSuffix: 'Spec.js'
            }, all:{
                specs: ['specs/**']
            }
        }, watch: {
            all: {
                files: ['specs/**/*.js', 'main.js'],
                tasks: ['jasmine_nodejs']
            }, grunt: {
                files: ['gruntfile.js']
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('default', ['jasmine_nodejs', 'watch']);
    grunt.registerTask('test', ['jasmine_nodejs']);
};