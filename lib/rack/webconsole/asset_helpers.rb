# encoding: utf-8
module Rack
  class Webconsole
    # Helper module to encapsulate the asset loading logic used by the {Assets}
    # middleware.
    #
    # For now, the strategy is reading the files from disk. In the future, we
    # should come up with a somewhat more sophisticated strategy, although
    # {Webconsole} is used only in development environments, where performance
    # isn't usually a concern.
    #
    module AssetHelpers
      
      # Returns a string with all the HTML, CSS and JavaScript code needed for
      # the view.
      #
      # It puts the security token inside the JavaScript to make AJAX calls
      # secure.
      #
      # @return [String] the injectable code.
      def self.code
        # Regenerate the security token
        token = Webconsole::Repl.reset_token
        html_code <<
          css_code <<
          render(js_code, :TOKEN => token, :KEY_CODE => Webconsole.key_code)
      end
      
      private
      
      # Loads the HTML from a file in `/public`.
      #
      # It contains a form and the needed divs to render the console.
      #
      # @return [String] the injectable HTML.
      def self.html_code
        out = ""
        out << asset('jquery.html') if Webconsole.inject_jquery
        out << asset('webconsole.html')
        out
      end

      # Loads the CSS from a file in `/public`.
      #
      # It contains the styles for the console.
      #
      # @return [String] the injectable CSS.
      def self.css_code
        '<style type="text/css">' <<
          asset('webconsole.css') <<
          '</style>'
      end

      # Loads the JavaScript from a file in `/public`.
      #
      # It contains the JavaScript logic of the webconsole.
      #
      # @return [String] the injectable JavaScript.
      def self.js_code
        '<script type="text/javascript">' <<
          asset('webconsole.js') <<
          '</script>'
      end

      # Inteprolates the given variables inside the javascrpt code
      #
      # @param [String] javascript The javascript code to insert the variables
      # @param [Hash] variables A hash containing the variables names (as keys)
      # and its values
      #
      # @return [String] the javascript code with the interpolated variables
      def self.render(javascript, variables = {})
        javascript_with_variables = javascript.dup
        variables.each_pair do |variable, value|
          javascript_with_variables.gsub!("$#{variable}", value)
        end
        javascript_with_variables
      end

      def self.asset(file)
        @@assets ||= {}
        output = ::File.open(::File.join(::File.dirname(__FILE__), '..', '..', '..', 'public', file), 'r:UTF-8') do |f|
          f.read
        end
        @@assets[file] ||= output
      end
    end
  end
end
