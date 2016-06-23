var express = require("express");
var im = require('imagemagick');
//var gm = require('gm');
var busboy = require('connect-busboy');
var format = require('util').format;
var qs = require('querystring');
var fs = require('fs');
var app = express();
var port = 9876;
var uploadPath = __dirname+"/public/uploads";
var xBound = 530;
var yBound = 850;

var objs = new Object();
var obj_count=0;
var schoolPic = '/uploads/preview/bigfoot.jpg';

objs['obj_schoolpic'] = {id:'obj_schoolpic',type:'schoolpic',img:schoolPic,
	x:220,y:280};
obj_count++;
objs['obj_school'] = {id:'obj_school',type:'school',img:'/images/school.png',
	x:200,y:200};
obj_count++;
objs['obj_opener'] = {id:'obj_opener',type:'opener',img:'/images/heisen-opener.png',
	x:400,y:500};
obj_count++;

var objects = ['at-r', 'a-r','a-o','a-y','a-g','a-b','a-p','b-g','b-b','c-p','c-r','d-o',
	'd-y','d-g','d-b','e-p','e-r','e-o','e-y','e-g','e-b','f-p','f-r','g-o','g-y',
	'g-g','h-b','h-p','i-r','i-o','i-y','i-g','i-b','i-p','j-g','k-b','l-p','l-r',
	'l-o','l-y','m-g','m-b','n-p','n-r','n-o','n-y','n-g','n-b','o-p','o-r','o-o',
	'o-y','o-g','o-b','p-o','p-y','q-g','r-b','r-p','r-r','r-o','r-y','r-g','s-b',
	's-p','s-r','s-o','t-y','t-g','t-b','t-p','t-r','t-o','u-y','u-g','u-b','u-p',
	'v-r','v-o','w-y','w-g','x-b','y-p','y-r','z-o'];

for(var i=0; i<objects.length; i++){
	objs['obj_'+obj_count] = {id:'obj_'+obj_count,type:'char',img:'/images/chars/'+objects[i]+'.png',
		x:Math.floor(Math.random()*xBound),y:Math.floor(Math.random()*yBound)};
	obj_count++;
}

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
    res.end();
});

app.use(busboy({limits: {fileSize: 10000000}})); 
app.use(express.static(__dirname + '/public'));

app.post("/uploadschool", function(req, res){
	var file_name = new Date().getTime();
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(uploadPath + '/full/' + file_name + '.jpg');
        file.pipe(fstream);
        fstream.on('close', function () {
            im.resize({
				srcPath:  uploadPath + '/full/' + file_name + '.jpg',
				dstPath:  uploadPath + '/preview/' + file_name + '.jpg' ,
				width:150,
				height:150
			}, function(err, stdout, stderr){
				if (err) {
					console.log('error while resizing images' + stderr);
				}else{
					schoolPic = '/uploads/preview/' + file_name + '.jpg';
					objs['obj_schoolpic']['img'] = schoolPic;
					io.sockets.emit('schoolimage', { path:schoolPic});
					
				}
			});
			
			/*gm('/path/to/image.jpg')
			.resize(353, 257)
			.autoOrient()
			.write(writeStream, function (err) {
			  if (!err) console.log(' hooray! ');
			});*/

        });
    });
    res.end();
});

var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
    socket.emit('init', { objs: objs});
    socket.on('send', function (data) {
		if(parseInt(data.x)!= NaN && parseInt(data.y)!= NaN){
			data.x = Math.max(0,Math.min(xBound,parseInt(data.x)));
			data.y = Math.max(0,Math.min(yBound,parseInt(data.y)));
			if(data.obj=='obj_school'){
	    		objs['obj_schoolpic'].x = data.x+20;
	    		objs['obj_schoolpic'].y = data.y+80;
			}
	    	objs[data.obj].x = data.x;
	    	objs[data.obj].y = data.y;
	    	
	    	data.type = objs[data.obj].type;
	        io.sockets.emit('message', data);
		}
    });
});