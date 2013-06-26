#!/usr/bin/env ruby

require 'bundler/setup'
require 'sinatra'
require 'rack/cors'

set :port, 8000
set :public_folder, "."

# Setup CORS to allow /echo from any host.
use Rack::Cors do |config|
  config.allow do |allow|
    allow.origins '*'
    allow.resource '/echo', :methods => [:post], :headers => :any
  end
end

# Echos back exactly what was sent into the body.
post '/echo' do
  return request.body.read()
end

