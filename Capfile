load 'deploy'
require 'rubygems'

# mbilker deploy file
#

default_run_options[:pty] = true
set :application, "todos"
set :repository,  "git@mbilker.us:mbilker/agenda-todos.git"
set :scm, :git
set :branch, "master"
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

def mkconfig
  env_lines = []
  deploy_env.each do |k,v|
    env_lines << "#{k}=#{v}"
  end
  return env_lines.join("\n") + "\n"
end

task :config do
  file = File.open('.env', mode='w')
  file.write(mkconfig)
  file.close
end

namespace :deploy do
  task :update_packages, roles => :app do
    run "cd #{release_path} && npm install --production --loglevel warn 2>&1"
  end

  task :restart, roles => :app do
    systemd_commands =
"sudo systemctl stop #{application}.target && \
 sudo systemctl disable #{application}.target && \
 cd #{release_path} && \
 sudo bundle exec systemd-foreman export systemd #{systemd_conf_path} -d #{release_path} -l /var/log/#{application} -a #{application} -u #{user} -p #{base_port} -c #{concurrency} && \
 sudo systemctl --system daemon-reload && \
 sudo systemctl enable #{application}.target && \
 sudo systemctl start #{application}.target"

    run systemd_commands

    nginx_commands =
"cd #{release_path} && \
 sudo BASE_DOMAIN=#{base_domain} bundle exec nginx-foreman export nginx #{nginx_conf_path} -d #{release_path} -l /var/log/#{application} -a #{application} -u #{user} -p #{base_port} -c #{concurrency} && \
 sudo systemctl restart nginx"

    run nginx_commands
  end
end

after 'deploy:restart', 'deploy:cleanup'
after 'deploy:finalize_update', 'deploy:update_packages'

before 'deploy:finalize_update' do
  run "cd #{release_path} && bundle install --deployment"
  put(mkconfig, "#{release_path}/.env")
end

