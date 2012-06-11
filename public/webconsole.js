(function($) {
  
  var webconsole = {
    history:[],
    pointer:0,
    query:$('#webconsole_query')
  }
  
  $('#rack-webconsole form').submit(function(e){
    e.preventDefault();
  });
	
	var prevStyle = {
		color: "#ffffff",
		bold: false,
		underline: false
	}
	
	// colors
	var colors = {
		30: "#eeeeee",
		31: "#ff6c60",
		32: "#a8ff60",
		33: "#ffffb6",
		34: "#96cbfe",
		35: "#ff73fd",
		36: "#c6c5fe",
		37: "#eeeeee"
	}
	var boldColors = {
		30: "#7c7c7c",
		31: "#ffb6b0",
		32: "#ceffac",
		33: "#ffffcb",
		34: "#b5dcfe",
		35: "#ff9cfe",
		36: "#dfdffe",
		37: "#ffffff"
	}
	
	function resetBashStyle()
	{
		prevStyle = {
			color: colors[37],
			bold: 'normal',
			underline: 'none'
		};
	}
	function bashColorToHtml(bcolor)
	{
		// set values
		var all = bcolor.split(/;/g)
		if (all.indexOf("0") > 0) // ignore anything before 0, since 0 resets
			all.splice(0, all.indexOf("0"));
		if (all.indexOf("0") >= 0)
			resetBashStyle();
		if (all.indexOf("1") >= 0)
			prevStyle['bold'] = 'bold';
		if (all.indexOf("4") >= 0)
			prevStyle['underline'] = 'underline';
		if (prevStyle['bold'] == 'bold')
			colorMap = boldColors;
		else
		  colorMap = colors;
		$.each(all, function(idx, val) {
			var i = parseInt(val);
			if (i > 10 && colorMap[i] != undefined)
				prevStyle['color'] = colorMap[i];
		});
		return 'color:'+prevStyle['color']+';font-weight:'+prevStyle['bold']+
			';text-decoration:'+prevStyle['underline'];
	}
	function parseBashString(str)
	{
		str = str.replace(/\u001B\[([0-9;]+)m/g, function(fm, sm) {
			return '</span><span style="'+bashColorToHtml(sm)+'">';
		}).replace(/\n/g, "<br>");
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
      if ($KEY_CODE.indexOf(event.which) >= 0) {
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
