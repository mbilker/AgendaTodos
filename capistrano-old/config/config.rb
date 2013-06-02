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
