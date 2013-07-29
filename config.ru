require 'bundler'
Bundler.require
require 'json'

set :public_folder, "."

# Setup CORS to allow /echo from any host.
use Rack::Cors do |config|
  config.allow do |allow|
    allow.origins '*'
    allow.resource '/echo', :methods => [:get], :headers => :any
  end
end

# Echos back exactly what was sent into the body.
get '/echo' do
  return JSON.generate(params)
end

# Redirect everything else to the index page.
not_found do
  redirect to('/test/index.html')
end

run Sinatra::Application
