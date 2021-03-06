var socketUrl = 'http://ps545991.dreamhostps.com:9875/';
var socket;
var sessionid;
$(function() {
	socket = io.connect(socketUrl);
    socket.on('connect', function () {
    	sessionid = this.socket.sessionid;
	});
    socket.on('init', function (data) {
    	$('#fridge').empty();
    	for (var k in data.objs) {
			var obj = data.objs[k];
    		$('#fridge').append('<img id="'+obj.id+
    			'" class="'+((obj.type!='schoolpic')?'drag ':'')+obj.type+
    			'" src="'+obj.img+'" '+
    			' style="left:'+obj.x+'px; top:'+obj.y+'px"'+' />');
    	}
    	$(".drag").draggable({
    		containment:"parent",
			drag: function() {
				socket.emit('send', 
					{sessionid: sessionid, x: $(this).css('left'), y: $(this).css('top'), obj: $(this).attr('id') });
      		}
    	}); 	
	    $('.schoolpic').click(function(){
            $('#picbutton').trigger('click');
	    });
	    $('#picbutton').change(function() {
			$('#uploadschool').ajaxSubmit(function(){});
		});
		$("#obj_opener").mousedown(function() {
  			var bottleOpen = new Audio("/sounds/bottle-open.mp3");
  			bottleOpen.play();
		});
		$("#obj_octocat").mouseup(function() {
			window.open('https://github.com/bezanis/funfridge','_blank');
		});
		$("#obj_shapesthegame").mouseup(function() {
			window.open('http://shapesthegame.com','_blank');
		});
    });
    socket.on('message', function (data) {
    	if(data.sessionid!=sessionid){
        	$('#'+data.obj).css('left', data.x);
        	$('#'+data.obj).css('top', data.y);
		}
    	if(data.type=='school'){
    		moveSchoolPic(parseInt(data.x,10),parseInt(data.y,10));
    	}
    });
    
    socket.on('schoolimage', function (data) {
    	$('#obj_schoolpic').attr('src', data.path);
    });
    
	function moveSchoolPic(x, y){
		$('.schoolpic').css('left',(x+20)+'px');
		$('.schoolpic').css('top',(y+80)+'px');
	}
});