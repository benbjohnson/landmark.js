#!/usr/bin/env ruby

require 'bundler/setup'
require 'sinatra'
require 'json'
require 'rack/cors'

set :port, 8000
set :public_folder, "."

# Setup CORS to allow /echo from any host.
use Rack::Cors do |config|
  config.allow do |allow|
    allow.origins '*'
    allow.resource '/echo', :methods => [:get], :headers => :any
  end
end

# Redirect to test page.
get '/' do
  redirect to('/test/index.html')
end

# Echos back exactly what was sent into the body.
get '/echo' do
  return JSON.generate(params)
end

