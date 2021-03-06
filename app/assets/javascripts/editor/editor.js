//キューブ数
function incrementCubeNum(increment_value){
	var cubeNumObject = $("#cube_num");
	var cubeNum = cubeNumObject.children("span").html() / 1;

	//increment
	cubeNumObject.children("span").html(cubeNum+1);
}
function setCubeNum(increment_value){
	$("#cube_num").children("span").html(0);
}

//デバッグJSON表示
function updateJSON(){
	var html_json = JSON.stringify(g_cubeJSON, null, 2);
	html_json_str = html_json.toString();
	//HTMLに表示するときに見やすく
	html_json_str = html_json_str.replaceAll("{", "<br>{")		
	$("#ui_json").html(html_json_str);
}

//ボクセルを生成しシーンに追加
//color = '#00ff00'
function makeVoxel(position_threejs, material){
	//生成
	var geometry = new THREE.CubeGeometry(CUBE_WIDTH, CUBE_WIDTH, CUBE_WIDTH);
	var voxel = new THREE.Mesh(geometry, material);
	
	voxel.position.copy(position_threejs);
	voxel.matrixAutoUpdate = false;
	voxel.updateMatrix();
	voxel.tag = 'cube';
	g_scene.add(voxel);		

	//キューブ数
	incrementCubeNum(1);
	//JSON
	addToJSON(position_threejs);
}

function addToJSON(voxelPosition){
	var cubePosition = {};
	//位置
	cubePosition.x = voxelPosition.x;
	cubePosition.y = voxelPosition.y;
	cubePosition.z = voxelPosition.z;
	//色
	//#ff0000
	var color_sharp = threeJsColor_to_sharpColor(g_cubeMaterial.color);
	//色をインデックスとしてJSONに登録
	//push
	var cubePositions = g_cubeJSON.cubes[color_sharp];
	if(cubePositions==undefined){
		cubePositions = [];
	}
	cubePositions.push(cubePosition);
	g_cubeJSON.cubes[color_sharp] = cubePositions;
}
function removeFromJSON(voxelPosition){
	//色一覧
	var color_keys = Object.keys(g_cubeJSON.cubes);

	//全探索して同じ位置のデータを削除
	for(var i=0; i<color_keys.length; i++){
		var color_key = color_keys[i];
		var position_array = g_cubeJSON.cubes[color_key];

		for(var j=0; j<position_array.length; j++){
			var position = position_array[j];

			//同じ位置なら削除
			if(isSamePosition(position, voxelPosition)){
				position_array.splice(j,1);
				//長さ0なら色ごと消す
				if(position_array.length==0){
					delete g_cubeJSON.cubes[color_key];
				}else{
					g_cubeJSON.cubes[color_key] = position_array;
				}
				break;
			}
		}
	}
}

$(function(){
	if(!Detector.webgl) Detector.addGetWebGLMessage();

	var container, stats;
	var g_renderer;
	var projector, plane, cube;
	var mouse3D, raycaster,

	//キー
	rollOveredFace = false;

	var rollOverMaterial;

	var voxelPosition = new THREE.Vector3();
	var tmpVec = new THREE.Vector3();
	var normalMatrix = new THREE.Matrix3();

	//生成されるキューブ
	var cubeGeo;

	var i, intersector;

	//デバッグ表示
	var debugHash = new Array();
	var ui_debug_variables = $("#ui_debug_variables");

	init();
	animate();

	//デバッグ情報更新
	function updateDebugInfo(){
		var html_variables = hash2html(debugHash);
		ui_debug_variables.html(html_variables);
	}

	function hash2html(hash){
	//function hash2html(){
		var html = '';
		for( var key in hash ){
			var val = hash[key];
			if($.isNumeric(val)){
				//数値なら、桁数制限
				val = val.toFixed(2);
			}
			var addHTML = key + ' : ' + val + '<br>';
			html += addHTML;
		}
		return html;
	}

	function init() {
		//ルート
		container = document.getElementById('container');
		$(container).css("width", "240px");
		$(container).css("height", "1000px");

		//デバッグ表示
		var debugInfo = document.getElementById('ui_debug');
		debugInfo.style.position = 'absolute';
		container.appendChild(debugInfo);

		//カメラ
		g_camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
		g_camera.position.y = 800;

		//シーン
		g_scene = new THREE.Scene();

		g_scene.add(getAxis());

		//マウスに付いてくるキューブ
		// roll-over helpers
		rollOverGeo = new THREE.CubeGeometry(CUBE_WIDTH, CUBE_WIDTH, CUBE_WIDTH);
		rollOverMaterial = new THREE.MeshBasicMaterial({ color: g_selectedColor, opacity: 0.5, transparent: true });
		g_rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		g_scene.add(g_rollOverMesh);
		//ミラー用
		g_rollOverMeshMirror = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		g_scene.add(g_rollOverMeshMirror);
		g_rollOverMeshMirror.visible = false;

		//メッシュの色を変えるテスト
		g_rollOverMesh.material = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true});

		// cubes
		cubeGeo = new THREE.CubeGeometry(CUBE_WIDTH, CUBE_WIDTH, CUBE_WIDTH);
		g_cubeMaterial = getCubeMaterial(0xfeb74c);

		//レイ
		projector = new THREE.Projector();

		//グリッド（もっと簡潔に書ける）
		var size = 500, step = 50;
		var geometry = new THREE.Geometry();
		for (var i=-size; i<=size; i+=step){
			geometry.vertices.push( new THREE.Vector3(-size, 0, i));
			geometry.vertices.push( new THREE.Vector3( size, 0, i));
			geometry.vertices.push( new THREE.Vector3(i, 0, -size));
			geometry.vertices.push( new THREE.Vector3(i, 0,  size));
		}
		var material = new THREE.LineBasicMaterial({color: 0x000000, opacity: 0.2});
		var line = new THREE.Line(geometry, material);
		line.type = THREE.LinePieces;
		g_scene.add(line);

		//?
		plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial());
		plane.rotation.x = -Math.PI/2;
		plane.visible = false;
		g_scene.add(plane);

		g_mouse2d = new THREE.Vector3(0, 10000, 0.5);

		//ライト
		var ambientLight = new THREE.AmbientLight(0x606060);
		g_scene.add(ambientLight);
		var directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(1, 0.75, 0.5).normalize();
		g_scene.add(directionalLight);

		//レンダラー
		g_renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
		//描画サイズ
		//ちょっと小さくすることで画面内におさめる
		// g_renderer.setSize(window.innerWidth-10, window.innerHeight-10);
		var paddingWidth = 10;
		g_renderer.setSize(window.innerWidth-paddingWidth, window.innerHeight-paddingWidth);
		container.appendChild(g_renderer.domElement); //canvas

		//負荷
		stats = new Stats();
		$("#ui_load_viewer").append(stats.domElement);

		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('mouseup'  , onDocumentMouseUp,   false);
		document.addEventListener('keydown'  , onDocumentKeyDown,   false);
		document.addEventListener('keyup'    , onDocumentKeyUp,     false);
		window.addEventListener('resize'     , onWindowResize,      false);
	}//init

	//リアル？
	function getRealIntersector(intersects){
		for(i=0; i<intersects.length; i++){
			intersector = intersects[i];
			if(intersector.object!=g_rollOverMesh){
				return intersector;
			}
		}
		return null;
	}

	//ボクセル位置
	function setVoxelPosition(intersector){
		if(intersector.face!=null){
			normalMatrix.getNormalMatrix(intersector.object.matrixWorld);
			tmpVec.copy(intersector.face.normal);
			tmpVec.applyMatrix3(normalMatrix).normalize();
			voxelPosition.addVectors(intersector.point, tmpVec);

			var w = CUBE_WIDTH;
			voxelPosition.x = Math.floor(voxelPosition.x / w) * w + w/2;
			voxelPosition.y = Math.floor(voxelPosition.y / w) * w + w/2;
			voxelPosition.z = Math.floor(voxelPosition.z / w) * w + w/2;
		}
	}

	//マウス押下時
	//キューブ生成
	function onDocumentMouseDown(event){
		event.preventDefault();

		switch(event.which){
			case MOUSE_LEFT:
				g_isMouseLeftPressed = true; break;
			case MOUSE_CENTER:
				g_isMouseCenterPressed = true; break;
			case MOUSE_RIGHT:
				g_isMouseRightPressed = true; break;
		}

		var intersects = raycaster.intersectObjects(g_scene.children);
		if(event.which==MOUSE_LEFT){
			if(intersects.length>0){
				intersector = getRealIntersector(intersects);

				//削除
				if(g_isCtrlDown){
					if(intersector.object!=plane){
						//消されるキューブ位置
						voxelPosition = intersector.object.position;
						//JSONから削除
						removeFromJSON(voxelPosition);

						//Sceneから削除
						g_scene.remove( intersector.object );
					}

				//作成
				} else {
					intersector = getRealIntersector(intersects);
					setVoxelPosition(intersector);

					//キューブ色更新
					// g_cubeMaterial = getCubeMaterial(g_selectedColor);
					g_cubeMaterial = g_selectedMaterial;

					//ボクセル実体化
					makeVoxel(voxelPosition, g_cubeMaterial);

					//ミラー
					if(g_isMirror){
						var mirrorPosition = voxelPosition.clone();
						mirrorPosition.x *= -1;
						makeVoxel(mirrorPosition, g_cubeMaterial);
					}
				}

				//JSON表示更新
				updateJSON();
			}
		}
		else if(event.which==MOUSE_RIGHT){
			//マウス位置保存
			g_oldPageX = event.pageX;
			g_oldPageY = event.pageY;

			//スポイト
			if(intersects.length>0){
				intersector = getRealIntersector(intersects);

				var intersectY = intersector.point.y | 0; //整数

				//平面と交差
				if(intersectY<=0){

				}
				//キューブと交差
				else{
					g_selectedMaterial = intersector.object.material;
					var color_threejs = g_selectedMaterial.color;
					var r255 = color_threejs.r * 255;
					var g255 = color_threejs.g * 255;
					var b255 = color_threejs.b * 255;
					var color_sharp = '#' + zero2(r255.toString(16)) + zero2(g255.toString(16)) + zero2(b255.toString(16));
					changeColorOfCube(sharpTo0x(color_sharp));
				}
			}
		}
		else{
			console.log('mouse center clicked');
		}
	}

	function isSamePosition(v0, v1){
		if(v0.x==v1.x && v0.y==v1.y && v0.z==v1.z){
			return true;
		}else{
			return false;
		}
	}

	//Update
	function animate() {
		requestAnimationFrame(animate);
		render();
		stats.update();
	}

	//デモ時の更新
	function updateOnDemo(){
		g_phi += 0.5;
	}

	//描画
	function render() {

		//デモONのとき
		if(g_isDemo){
			updateOnDemo();
		}

		raycaster = projector.pickingRay(g_mouse2d.clone(), g_camera);
		var intersects = raycaster.intersectObjects(g_scene.children);

		if(intersects.length>0){
			intersector = getRealIntersector(intersects);
			if(intersector){
				setVoxelPosition(intersector);
				g_rollOverMesh.position = voxelPosition;

				if(g_isMirror){
					var voxelPositionMirror = voxelPosition.clone();
					voxelPositionMirror.x *= -1;
					g_rollOverMeshMirror.position = voxelPositionMirror;

				}
			}
		}

		//アローキーの回転
		if(g_pressedArrowKey){
			//シーン回転
			var rotateSpeed = 2;
			switch(g_pressedArrowKey){
				case KEY_LEFT:
					g_phi += rotateSpeed;
					break;
				case KEY_RIGHT:
					g_phi -= rotateSpeed;
					break;
				case KEY_UP:
					g_theta += rotateSpeed;
					break;
				case KEY_DOWN:
					g_theta -= rotateSpeed;
					break;
			}
			g_theta = thetaInRange(g_theta);
			g_theta = degreeInRange(g_theta);
			g_phi = degreeInRange(g_phi);
		}
		//デバッグ情報
		debugHash['g_theta'] = g_theta;
		debugHash['g_phi'] = g_phi;
		updateDebugInfo();


		//ステージではなくカメラを回転させる
		//camera.position.x = cameraR * Math.sin( THREE.Math.degToRad( g_theta ) );
		//camera.position.z = cameraR * Math.cos( THREE.Math.degToRad( g_theta ) );

		//球座標
		var sin_g_theta = Math.sin(THREE.Math.degToRad(g_theta));
		var cos_g_theta = Math.cos(THREE.Math.degToRad(g_theta));
		var sin_g_phi   = Math.sin(THREE.Math.degToRad(g_phi));
		var cos_g_phi   = Math.cos(THREE.Math.degToRad(g_phi));
		g_camera.position.x = g_cameraR * sin_g_theta * cos_g_phi;
		g_camera.position.z = g_cameraR * sin_g_theta * sin_g_phi;
		g_camera.position.y = g_cameraR * cos_g_theta;

		g_camera.lookAt(g_scene.position);

		g_renderer.render(g_scene, g_camera);
	}
});