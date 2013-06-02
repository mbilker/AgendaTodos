namespace :npm do
 task :refresh_symlink, roles => :app do
    print " --> Symlinking node_modules...".yellow
    run "rm -rf #{current_path}/node_modules && ln -s #{shared_path}/node_modules #{current_path}/node_modules"
    puts "Done.".green
  end

  task :create_folder, :roles => :app, :except => { :no_release => true } do
    print " --> Creating shared node_modules...".yellow
    run "mkdir -p #{shared_path}/node_modules"
    puts "Done.".green
  end

  task :install, roles => :app do
    print " --> Running npm install...".yellow
    run "cd #{release_path} && npm install --production 2>#{shared_path}/log/npm.log"
    puts "Done.".green
  end
end

after 'deploy:create_symlink', 'npm:create_folder', 'npm:refresh_symlink'

before 'deploy:start', 'npm:install'
before 'deploy:restart', 'npm:install'