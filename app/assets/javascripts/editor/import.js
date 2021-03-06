function importFromWeb(id){

	//ajax GET
	$.ajax({
	    url: 'http://192.168.33.10:3000/voxeljsons/'+id,
	    //url: 'http://api.stackoverflow.com/1.1/stats',
	    type: 'GET',
	    dataType: 'jsonp',
	    jsonp : 'jsonp',

	    // success: function(html){
	    // 	p('success html');
	    // 	p(html);
	    // },

	    // error: function(html){
	    // 	p('error html');
	    // 	p(html);
	    // }
	});
}

function callbackfunc(json_object){
	//var json_str = JSON.stringify(json_object);

	//JSONからボクセル生成
	constructVoxels(json_object);
}

//JSONからキューブを配置する
function constructVoxels(json_object){
	var cubes = json_object.cubes;

	//キー(色)でfor
	var keys = Object.keys(cubes);

	for(var i=0; i<keys.length; i++){
		var color = keys[i];

		//座標でfor
		var xyzArray = cubes[color];

		for(var j=0; j<xyzArray.length; j++){
			var xyz = xyzArray[j];

			var x = xyz.x;
			var y = xyz.y;
			var z = xyz.z;

			//生成
			generateVoxel(x,y,z,color);
		}
	}

}

//ボクセル作成
function generateVoxel(x,y,z,color){
	p('gen voxel at');
	p([x,y,z,color]);

	var position_threejs = new THREE.Vector3(x,y,z);
	var material = getCubeMaterial(color);

	makeVoxel(position_threejs, material);
}

function prepareImportButtons(){
	var id_array = [6,7,8,9,10];
	var importButtons = $("#importButtons");
	importButtons.empty();
	for(var i=0; i<id_array.length; i++){
		var id = id_array[i];
		var button = $("<button>");
		button.addClass("btn btn-primary");
		button.text(id);
		button.css({'margin':'2px'});
		button.attr("onClick", "importFromWeb("+id+")");
		importButtons.append(button);
	}
}
