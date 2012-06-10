# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "rack/webconsole/version"

Gem::Specification.new do |s|
  s.name        = "rack-webconsole-pry"
  s.version     = Rack::Webconsole::VERSION
  s.authors     = ["Josep M. Bach", "Josep Jaume Rey", "Oriol Gual", "Jan Berdajs"]
  s.email       = ["mrbrdo@gmail.com"]
  s.homepage    = "http://github.com/mrbrdo/rack-webconsole"
  s.summary     = %q{Rack-based console inside your web applications, using pry}
  s.description = %q{Rack-based console inside your web applications, using pry}

  s.rubyforge_project = "rack-webconsole-pry"

  s.add_runtime_dependency 'rack'
  s.add_runtime_dependency 'json'
  s.add_runtime_dependency 'multi_json', '>= 1.0.3'
  s.add_runtime_dependency 'pry'

  s.add_development_dependency 'minitest'
  s.add_development_dependency 'purdytest'

  # Since we can't have a git dependency in gemspec, we specify this
  # dependency directly in the Gemfile. Once a new mocha version is released,
  # we should uncomment this line and remove mocha from the Gemfile.
  # s.add_development_dependency 'mocha'

  s.add_development_dependency 'yard'
  s.add_development_dependency 'bluecloth'
  s.add_development_dependency 'rake'

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_paths = ["lib"]
end
