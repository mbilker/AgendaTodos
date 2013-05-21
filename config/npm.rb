namespace :deploy do
 task :refresh_symlink, roles => :app do
    print " --> Symlinking node_modules...".yellow
    run "rm -rf #{current_path}/node_modules && ln -s #{shared_path}/node_modules #{current_path}/node_modules"
    puts "Done.".green
  end

  task :npm_install, roles => :app do
    print " --> Running npm...".yellow
    run "cd #{release_path} && npm install --production 2>#{shared_path}/npm.log"
    puts "Done.".green
  end
end

after 'deploy:finalize_update', 'deploy:refresh_symlink', 'deploy:npm_install'
