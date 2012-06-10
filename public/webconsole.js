(function($) {
  
  var webconsole = {
    history:[],
    pointer:0,
    query:$('#webconsole_query')
  }
  
  $('#rack-webconsole form').submit(function(e){
    e.preventDefault();
  });
	
	function componentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
	    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	
	function bashColorToHtml(bcolor)
	{
		var str = "[0m 238 238 238 \
		[1m 255 255 255 \
		[0m 238 238 238 \
		[1m 255 255 255 \
		[0;30m 238 238 238 \
		[1;37m 255 255 255 \
		[0;34m 150 203 254 \
		[1;34m 181 220 254 \
		[0;32m 168 255 96 \
		[1;32m 206 255 172 \
		[0;36m 198 197 254 \
		[1;36m 223 223 254 \
		[0;31m 255 108 96 \
		[1;31m 255 182 176 \
		[0;35m 255 115 253 \
		[1;35m 255 156 254 \
		[0;33m 255 255 182 \
		[1;33m 255 255 203 \
		[1;30m 124 124 124 \
		[0;37m 238 238 238";
		var colors = {};
		var matcher = /(\[[0-9;]+m)\s+(\d+)\s+(\d+)\s+(\d+)/gm;
		while ((r = matcher.exec(str)) != null) {
			colors[r[1]] = rgbToHex(parseInt(r[2]), parseInt(r[3]), parseInt(r[4]));
		}
		if (/^\[\d\d/.exec(bcolor)) {
			bcolor = "[0;" + bcolor.substr(1)
		}
		var res = 'color:' + colors[bcolor] + ';font-weight:';
		if (bcolor[1] == "1")
			res += 'bold';
		else
			res += 'normal';
		return res;
	}
	function parseBashString(str)
	{
		str = str.replace(/\u001B(\[[0-9;]+m)/g, function(fm, sm) {
			return '</span><span style="'+bashColorToHtml(sm)+'">';
		});
		str = str.replace(/\n/g, "<br>");
		return '<span>'+str+'</span>';
	}
  $("#rack-webconsole form input").keyup(function(event) {
    function escapeHTML(string) {
      return(string.replace(/&/g,'&amp;').
        replace(/>/g,'&gt;').
        replace(/</g,'&lt;').
        replace(/"/g,'&quot;')
      );
    };

    // enter
    if (event.which == 13) {
      webconsole.history.push(webconsole.query.val());
      webconsole.pointer = webconsole.history.length - 1;
      $.ajax({
        url: '/webconsole',
        type: 'POST',
        dataType: 'json',
        data: ({query: webconsole.query.val(), token: "$TOKEN"}),
        success: function (data) {
          var query_class = data.previous_multi_line ? 'query_multiline' : 'query';
          var result = "<div class='" + query_class + "'>" +
            parseBashString(escapeHTML(data.prompt)) + "</div>";
          if (!data.multi_line) {
            result += "<div class='result'>" + parseBashString(escapeHTML(data.result)) + "</div>";
          }
          $("#rack-webconsole .results").append(result);
          $("#rack-webconsole .results_wrapper").scrollTop(
            $("#rack-webconsole .results").height()
          );
        }
      });
	    webconsole.query.val('');
    }
    
    // up
    if (event.which == 38) {
      if (webconsole.pointer < 0) {
        webconsole.query.val('');
      } else {
        if (webconsole.pointer == webconsole.history.length) {
          webconsole.pointer = webconsole.history.length - 1;
        }
        webconsole.query.val(webconsole.history[webconsole.pointer]);
        webconsole.pointer--;
      }
    }
    
    // down
    if (event.which == 40) {
      if (webconsole.pointer == webconsole.history.length) {
        webconsole.query.val('');
      } else {
        if (webconsole.pointer < 0) {
          webconsole.pointer = 0;
        }
        webconsole.query.val(webconsole.history[webconsole.pointer]);
        webconsole.pointer++;
      }
    }
    
  });

  $(document).ready(function() {
    $(this).keypress(function(event) {
      if (event.which == $KEY_CODE) {
        $("#rack-webconsole").slideToggle('fast', function() {
          if ($(this).is(':visible')) {
            $("#rack-webconsole form input").focus();
            $("#rack-webconsole .results_wrapper").scrollTop(
              $("#rack-webconsole .results").height()
            );
          } else {
            $("#rack-webconsole form input").blur();
          }
        });
        event.preventDefault();
      }
    });
  });
})(jQuery);
