deploy_env = {
  'MONGODB_URL' => 'mongodb://node:1j24561b3b5j3@dharma.mongohq.com:10017/agenda-book',
  'LOG_TO_FILE' => 'true',
  'NODE_ENV' => 'production',
}

env_lines = []
deploy_env.each do |k,v|
  env_lines << "#{k}=#{v}"
end
env_contents = env_lines.join("\n") + "\n"

file = File.open('.env', mode='w')
file.write(env_contents)
file.close
