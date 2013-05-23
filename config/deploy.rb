require 'rubygems'
require 'colored'

# mbilker deploy file
#

load 'npm'
load 'config'

default_run_options[:pty] = true
logger.level = Capistrano::Logger::IMPORTANT
set :application, 'todos'
set :repository,  'git@mbilker.us:mbilker/agenda-todos.git'
set :scm, :git
set :branch, 'master'
set :deploy_via, :remote_cache
set :user, "app"
set :ssh_options, { :forward_agent => true }
set :normalize_asset_timestamps, false

role :app, "mbilker.us"

set :base_port, 6100
set :concurrency, 'web=1'
set :systemd_conf_path, '/usr/lib/systemd/system'
set :nginx_conf_path, '/etc/nginx/apps'
set :base_domain, 'mbilker.us'

set :deploy_env, {
  'MONGODB_URL' => 'mongodb://node:1j24561b3b5j3@dharma.mongohq.com:10017/agenda-book',
  'LOG_TO_FILE' => 'true',
  'NODE_ENV' => 'production',
}

namespace :deploy do
  task :restart, roles => :app do
    print " --> Restarting app...".yellow
    run [
      "sudo systemctl stop #{application}.target",
      "sudo systemctl disable #{application}.target",
      "cd #{release_path}",
      "sudo bundle exec systemd-foreman export systemd #{systemd_conf_path} -d #{release_path} -l /var/log/#{application} -a #{application} -u #{user} -p #{base_port} -c #{concurrency}",
      "sudo systemctl --system daemon-reload",
      "sudo systemctl enable #{application}.target",
      "sudo systemctl start #{application}.target"
    ].join(" && ")
    puts "Done.".green

    print " --> Restarting nginx...".yellow
    run [
      "cd #{release_path}",
      "sudo BASE_DOMAIN=#{base_domain} bundle exec nginx-foreman export nginx #{nginx_conf_path} -d #{release_path} -l /var/log/#{application} -a #{application} -u #{user} -p #{base_port} -c #{concurrency}",
      "sudo systemctl restart nginx"
    ].join(" && ")
    puts "Done.".green
  end
end

after 'deploy:restart', 'deploy:cleanup'

before 'deploy:finalize_update' do
  print " --> Running bundler...".yellow
  run "cd #{release_path} && bundle install --deployment 2>/dev/null"
  puts "Done.".green
  print " --> Generating config...".yellow
  put(mkconfig, "#{release_path}/.env")
  puts "Done.".green
end
