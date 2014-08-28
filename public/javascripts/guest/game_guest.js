$(document).ready(function() {
    $("#makeMeScrollable").smoothDivScroll({ 
        mousewheelScrolling: false,
        manualContinuousScrolling: false,
        autoScrollingMode: "onStart",
        autoScrollingStep: 1,
        autoScrollingInterval: 100
    });
});


//----------------------------------------------------------
// ---- socket ------
//----------------------------------------------------------
// create socket
var socketReady = false;
var port = 9001;
var socket = io.connect('http://localhost:' + port + '/');
  // socket: channel connected
socket.on('connect', onOpened)
    .on('message', onMessage);
 
function onOpened(evt) {
    console.log('socket opened.');
    socketReady = true;
}
 
  // socket: accept connection request
function onMessage(evt) {
    if (evt.type === 'offer') {
        console.log("Received offer, set offer, sending answer....")
        onOffer(evt);      
    } else if (evt.type === 'answer' && peerStarted) {
        console.log('Received answer, settinng answer SDP');
        onAnswer(evt);
    } else if (evt.type === 'candidate' && peerStarted) {
        console.log('Received ICE candidate...');
        onCandidate(evt);
    } else if (evt.type === 'user dissconnected' && peerStarted) {
        console.log("disconnected");
        stop();
    }else{
        console.log(evt);
        var send_user = checkUser(evt.user, evt.user_unique_id);
        addChatLogRow(send_user.user_id, send_user.unique_id, send_user.user_color, evt.msg);
    }
}

function checkUser(user, unique_id){
    var tmp_user = user_manager.find_user(unique_id);
    //This user is user we don't know
    if (tmp_user == undefined){
        console.log("New Regist");
        //Regist
        var new_user = new User(user, "", unique_id);
        user_manager.add_user(new_user);
        return new_user;
    }
    //We know him
    else{
        return tmp_user
    }
}

var randnum = Math.floor( Math.random() * 100 );
var user = new User("aginika"+randnum, "");
var user_manager = new UserManager();


function SendMsg() {
    var msg = document.getElementById("chat-text").value;
    var tbody = document.getElementById("chat-log-tbody");
    addChatLogRow(user.user_id, user.unique_id, user.user_color, msg);
    console.log("send message : " + msg);
    // メッセージを発射する
    socket.emit('message', { user: user.user_id, msg: msg, user_unique_id: user.unique_id});
}


//----------------------------------------------------------
// ---- socket end ------
//----------------------------------------------------------


//----------------------------------------------------------
// ---- chat table functions ------
//----------------------------------------------------------
var row_num = 0;

function addChatLogRow(user_id, unique_id, user_color, msg){
    row_num += 1;
    $("<tr class='chat-log-row "+ unique_id +"'><td class='chat-log-id'>"
      +row_num+"</td><td class='chat-log-user-label'>"+ user_id +"</td><td class='chat-log-message'>"+msg+"</td></tr>").hide().appendTo($("#chat-log-tbody")).show('slow');

    //Scroll to Bottom
    var objDiv = document.getElementById("chat-log");
    objDiv.scrollTop = objDiv.scrollHeight;

    //update background color for new row
    rowColorUpdate(unique_id, user_color);
}

function rowColorUpdate(user_unique_id, user_color){
    $("."+user_unique_id).css("background-color",user_color);
}

//----------------------------------------------------------
// ---- chat table end ------
//----------------------------------------------------------

var main = function () {
    var scene = new THREE.Scene();
    
    var height = 1 * document.getElementsByClassName("game-display")[0].offsetHeight- 20;
    var width  = height *3.0/2.0;
    var fov    = 60;
    var aspect = width / height;
    var near   = 1;
    var far    = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 50 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.getElementsByClassName("game-display")[0].appendChild( renderer.domElement );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 0.7, 0.7 );
    scene.add( directionalLight );

    var geometry = new THREE.CubeGeometry( 30, 30, 30 );
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    ( function renderLoop () {
        requestAnimationFrame( renderLoop );
        mesh.rotation.set(
            0,
            mesh.rotation.y + 0.01,
            mesh.rotation.z + 0.01
        )
        renderer.render( scene, camera );
    } )();
};

window.addEventListener( 'DOMContentLoaded', main, false );
