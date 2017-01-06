var fs =require("fs");
var rp = require("request-promise");


var url = "http://pokeunlock.com/wp-content/uploads/2015/01/";
for(var i=1; i<722; i++){
	var padding=null;
	switch(i.toString().length){
		case 1:
			padding="00";
			break;
		case 2:
			padding="0";
			break;
		case 3:
			padding="";
			break;
	}
	rp(url+padding+i+".png")
	.pipe(fs.createWriteStream("./output/"+padding+i+".png"));
}

