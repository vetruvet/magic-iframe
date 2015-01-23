module.exports = function (grunt) {
  grunt.initConfig({
    uglify: {
      all: {
        options: {
          sourceMap: true
        },
        files: {
          'dist/magic-iframe.min.js': [
            'src/magic-iframe.js'
          ]
        }
      }
    },

    clean: ['dist/']
  });


  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('js', ['newer:uglify:all']);

  grunt.registerTask('watch', ['watch:js']);

  grunt.registerTask('default', ['clean', 'js']);
};