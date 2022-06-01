
module.exports = {
	header : function(response){
		if(!response.finished){
			response.write("<html>\n");
			response.write("<head></head>\n");
			response.write("<body>\n\n\t");
		}
	},
	footer : function(response){
		if(!response.finished){
			response.write("</body>\n");
			response.write("</html>");	
			response.end();
		}
	},
	titleHeader : function(response){
		if(!response.finished){
			response.write("<h1>Following are the titles of given websites: </h1>\n\n");
			response.write("\t<ul>\n")
		}
	},
	titleFooter : function(response){
		if(!response.finished){
			response.write("\t</ul>\n")
		}
	},
	title : function(response,title){
		if(!response.finished){
			response.write("\t\t<li>" + title + "</li>\n");
		}
	},
	errorLog : function(response,msg){
		if(!response.finished){
			response.write(msg);
		}
	}
}
