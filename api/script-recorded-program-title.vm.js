(function() {
	
	var program = chinachu.getProgramById(request.param.id, data.recorded);
	
	if (program === null) return response.error(404);
	
	program.isRemoved = !fs.existsSync(program.recorded);
	
	switch (request.method) {
		case 'PUT':
	  util.log(request.query);
			if (request.headers['content-type'].match(/^application\/json/) === null) {
				response.error(400);
			} else if (request.query === '') {
				response.error(400);
			} else {
				data.recorded = (function() {
					var array = [];
					
					data.recorded.forEach(function(a) {
						if (a.id === program.id) {
						  a.title = request.query.title;
						}
						array.push(a);
					});
					
					return array;
				})();
				
				fs.writeFileSync(define.RECORDED_DATA_FILE, JSON.stringify(data.recorded));
				
				response.head(201);
				response.end('{}');
			}
			return;
	}

})();