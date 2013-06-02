module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bgShell: {
      runNode: {
        cmd: 'node ./node_modules/nodemon/nodemon.js bin/app',
        bg: true
      }
    },
    stylus: {
      compile: {
        options: {
          paths: ['assets/css/**/*.styl'],
          'include css': true
        },
        files: {
          'public/css/style.css': 'assets/css/index.styl'
        }
      }
    },
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        src: ['assets/js/**/*.js'],
        dest: 'public/js/todos-main.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! todos-main <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/js/todos-main.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    watch: {
      scripts: {
        files: 'assets/js/**/*.js',
        tasks: ['compile-js'],
        options: {
          interrupt: true
        }
      },
      stylesheets: {
        files: 'assets/css/**/*.styl',
        tasks: ['compile-css'],
        options: {
          interrupt: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bg-shell');

  grunt.registerTask('compile-js', ['concat', 'uglify']);
  grunt.registerTask('compile-css', ['stylus']);
  grunt.registerTask('compile', ['compile-js', 'compile-css']);

  grunt.registerTask('server', ['bgShell:runNode', 'compile', 'watch']);

  grunt.registerTask('default', ['compile']);
}
