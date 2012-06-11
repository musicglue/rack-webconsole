# encoding: utf-8
require 'spec_helper'

class AssetClass
  def method_missing name, *args, &block
    Rack::Webconsole::AssetHelpers.send(name, *args, &block)
  end
end

module Rack
  describe Webconsole::AssetHelpers do

    describe '#html_code' do
      it 'loads the html code' do
        asset_class = AssetClass.new
        html = asset_class.html_code

        html.must_match /console/
        html.must_match /results/
        html.must_match /form/
      end
    end
    
    describe "#code" do
      it 'injects the token and key_code' do
        Webconsole.key_code = "96"

        assets_code = AssetClass.new.code

        assets_code.must_include Rack::Webconsole::Repl::send(:class_variable_get, "@@tokens").keys.first
        assets_code.must_match /\[96\]/
      end
    end

    describe '#css_code' do
      it 'loads the css code' do
        asset_class = AssetClass.new
        css = asset_class.css_code

        css.must_match /<style/
        css.must_match /text\/css/
        css.must_match /#console/
      end
    end

    describe '#js_code' do
      it 'loads the js code' do
        asset_class = AssetClass.new
        js = asset_class.js_code

        js.must_match /\$\("#rack-webconsole"\)/
        js.must_match /escapeHTML/
      end
    end

    describe '#render' do
      it 'knows how to replace $ vars' do
        asset_class = AssetClass.new

        text = "test $test test $test"
        asset_class.render(text, :test => "123").must_equal("test 123 test 123")

        text = "test $var1 test $var2"
        asset_class.render(text, :var1 => "123", :var2 => "321").must_equal("test 123 test 321")
      end
    end

  end
end
