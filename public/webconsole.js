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
	var prevStyle = {
		color: "#ffffff",
		bold: false,
		underline: false
	}
	function bashColorToHtml(bcolor)
	{
		// colors
		var textColor = rgbToHex(238, 238, 238);
		var boldColor = rgbToHex(255, 255, 255);
		var strColors = "[0;30m 238 238 238 \
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
		var boldColors = {};
		var matcher = /\[([0-9;]+)m\s+(\d+)\s+(\d+)\s+(\d+)/gm;
		while ((r = matcher.exec(strColors)) != null) {
			components = r[1].split(";")
			if (components[0] == "0")
				colors[components[1]] = rgbToHex(parseInt(r[2]), parseInt(r[3]), parseInt(r[4]));
			else
				boldColors[components[1]] = rgbToHex(parseInt(r[2]), parseInt(r[3]), parseInt(r[4]));
		}
		// set values
		all = bcolor.split(/;/g)
		if (all.indexOf("0") >= 0 && all.indexOf("0") > 0) // ignore anything before 0, since 0 resets
			all.splice(0, all.indexOf("0"));
		if (all.indexOf("0") >= 0)
			prevStyle = {
				color: textColor,
				bold: false,
				underline: false
			};
		if (all.indexOf("1") >= 0)
			prevStyle['bold'] = true;
		if (all.indexOf("4") >= 0)
			prevStyle['underline'] = true;
		if (prevStyle['bold'])
			colorMap = boldColors;
		else
		  colorMap = colors;
		$.each(all, function(idx, val) {
			if (colorMap[val] != undefined)
				prevStyle['color'] = colorMap[val];
		});
		return 'color:'+prevStyle['color']+';font-weight:'+(prevStyle['bold'] ? 'bold' : 'normal')+
			';text-decoration:'+(prevStyle['underline'] ? 'underline' : 'none');
	}
	function parseBashString(str)
	{
		str = str.replace(/\u001B\[([0-9;]+)m/g, function(fm, sm) {
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
