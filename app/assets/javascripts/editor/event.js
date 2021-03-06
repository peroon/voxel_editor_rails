//ウィンドウリサイズ時
function onWindowResize() {
	g_camera.aspect = window.innerWidth / window.innerHeight;
	g_camera.updateProjectionMatrix();
	g_renderer.setSize( window.innerWidth, window.innerHeight );
}

//マウス移動時
//X, Y = -1~1
function onDocumentMouseMove( event ) {
	event.preventDefault();
	g_mouse2d.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	g_mouse2d.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	if(g_isMouseRightPressed){
		//右クリックドラッグでカメラ回転
		var diffX = event.pageX - g_oldPageX;
		var diffY = event.pageY - g_oldPageY;

		//カメラ角度
		g_phi += (diffX/5);
		g_theta -= (diffY/5);

		//保存
		g_oldPageX = event.pageX;
		g_oldPageY = event.pageY;
	}
}

//マウスボタンを離したとき
function onDocumentMouseUp( event ) {
	switch(event.which){
		case MOUSE_LEFT:
			g_isMouseLeftPressed = false; break;
		case MOUSE_CENTER:
			g_isMouseCenterPressed = false; break;
		case MOUSE_RIGHT:
			g_isMouseRightPressed = false; break;
	}
}

//キー押下
function onDocumentKeyDown( event ) {
	switch( event.keyCode ) {
		case 16: g_isShiftDown = true; break;
		case 17: g_isCtrlDown = true; break;

		//アローキー
		case KEY_LEFT:
		case KEY_RIGHT:
		//case KEY_UP:
		//case KEY_DOWN:
			g_pressedArrowKey = event.keyCode;
			break;
	}
}

//キーUP時
function onDocumentKeyUp( event ) {
	//p('KEY ' + event.keyCode);
	switch ( event.keyCode ) {
		case 16: g_isShiftDown = false; break;
		case 17: g_isCtrlDown = false; p('ctrl up'); break;

		//アローキー
		case KEY_LEFT:
		case KEY_RIGHT:
		case KEY_UP:
		case KEY_DOWN:
			g_pressedArrowKey = false;
			break;

		//文字キー
		case KEY_T:
			toggleToolVisible();
			break;
	}
}

function toggleToolVisible(){
	//ツール
	$("div#ui_base").toggle();
	//デバッグ表示
	$("div#ui_debug").toggle();
	$("div#stats").toggle();
}