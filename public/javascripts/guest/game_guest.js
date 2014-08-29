$(document).ready(function() {
    $("#makeMeScrollable").smoothDivScroll({ 
        mousewheelScrolling: false,
        manualContinuousScrolling: false,
        autoScrollingMode: "onStart",
        autoScrollingStep: 1,
        autoScrollingInterval: 100
    });
});
//--------------------------
// -- User ---
//---------------------------
var randnum = Math.floor( Math.random() * 100 );
var user = new User("aginika"+randnum, "");
var user_manager = new UserManager();


//-------------------------------------------
// --- Map    ------
//-------------------------------------------
var maps = {};
var d2_map = new Map("room_map", true);
d2_map.set_player_initpos(100, 100);
//add my user
d2_map.add_new_map_player("aginika", user.unique_id);
d2_map.set_min_max(0, 0, 690,480);
maps[d2_map.map_name] = d2_map;


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
        //Chat
        if(evt.mst_type == "chat"){
            var send_user = checkUser(evt.user, evt.user_unique_id);
            addChatLogRow(send_user.user_id,
                          send_user.unique_id,
                          send_user.user_color,
                          evt.msg);
        }
        //Map Maniplutaion
        else if(evt.msg_type == "map_manip"){
            if(evt.manip_info.map_manip_type == "move_user"){
                var target_map = maps[evt.manip_info.map_name];
                if(target_map){
                    var target_player = target_map.get_player(evt.manip_info.unique_id);
                    if(target_player)
                        target_map.update_player_pos(
                            evt.manip_info.unique_id,
                            evt.manip_info.x,
                            evt.manip_info.y);
                    else
                        target_map.add_exist_map_player(
                            evt.manip_info.character_name,
                            evt.manip_info.unique_id,
                            evt.manip_info.x,
                            evt.manip_info.y);
                }else{
                    console.log("No Map found");
                }
            }
        }
        //Map Manipluration end
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


function SendMsg() {
    var msg = document.getElementById("chat-text").value;
    var tbody = document.getElementById("chat-log-tbody");
    addChatLogRow(user.user_id, user.unique_id, user.user_color, msg);
    console.log("send message : " + msg);
    // メッセージを発射する
    socket.emit('message', { user: user.user_id, msg: msg, user_unique_id: user.unique_id, msg_type:"chat"});
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
    //Setup 2dCanvas
    var my_user = user;
    var height = 1 * document.getElementById("3d_view").offsetHeight;
    var width  = height *3.0/2.0;
    var renderer_2d = document.createElement("canvas");
    renderer_2d.width = width;
    renderer_2d.height = height;
    renderer_2d.style.float="left";
    //obj.setAttribute("style","color:#000000;font-size:12px;");
    var canvas_parent = document.getElementById('2d_display');
    canvas_parent.appendChild(renderer_2d);
    var ctx = renderer_2d.getContext('2d');
    var img = new Image();
    img.src = "/images/map_sample.png";
    img.onload = function() {
        ctx.drawImage(img, 5, 5, width - 5, height - 5);
    };

    var canvas_controller_parent = document.getElementById('2d_map_con');
    var joystick = new VirtualJoystick({
        container: canvas_controller_parent,
        mouseSupport: true,
        stationaryBase: true,
        limitStickTravel: true,
        stickRadius: 50,
        baseX: 100,
        baseY: 100
    });
    joystick.addEventListener('touchStart', function(){
        console.log('down')
    })
    joystick.addEventListener('touchEnd', function(){
        console.log('up')
    })

    var counter = 0;
    setInterval(function(){
        if(joystick._pressed){
            var speed_x = Math.min(joystick.deltaX() * 0.3, 4);
            var speed_y = Math.min(joystick.deltaY() * 0.3, 4);
            var user = d2_map.get_player(my_user.unique_id);
            var user_x = user.map_x;
            var user_y = user.map_y;
            user_x += speed_x;
            user_y += speed_y;
            if(user_x < d2_map.min_map_x ) user_x = 0;
            if(user_y < d2_map.min_map_y ) user_y = 0;
            if(user_x > d2_map.max_map_x ) user_x = 400;
            if(user_y > d2_map.max_map_x ) user_y = 400;
            d2_map.update_player_pos(my_user.unique_id, user_x, user_y);
            if(counter%10 == 0){
                //send pos
                var msg =
                    {msg_type:"map_manip",
                     manip_info:
                     {
                         map_manip_type:"move_user",
                         map_name:"room_map",
                         unique_id: my_user.unique_id,
                         x: user_x,
                         y: user_y,
                         character_name: my_user.character_name
                     }
                    };
                socket.emit('message', msg);
            }
            counter++;
        }else{
            counter = 0;
        }
    }, 1/10 * 1000);

    ( function render2dMapLoop () {
        // requestAnimationFrame( renderLoop );
        ctx.clearRect (0, 0, width, height);
        ctx.drawImage(img, 5, 5, width - 5, height - 5);
        var target_users = d2_map.map_players;
        for (var id in target_users){
            var target_user = target_users[id];
            ctx.beginPath();
            ctx.fillStyle = target_user.color;
            ctx.arc( target_user.map_x, target_user.map_y, 10, 0, Math.PI*2, true);
            ctx.closePath();
            ctx.fill();
        }
        window.setTimeout(render2dMapLoop, 1000 / 10);
    } )();


    //SetUp 3dCanvas

    var scene = new THREE.Scene();
    
    height = 1 * document.getElementById("3d_view").offsetHeight;
    width  = height *3.0/2.0;
    var fov    = 60;
    var aspect = width / height;
    var near   = 1;
    var far    = 1000;
    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 0, 50 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.getElementById("3d_view").appendChild( renderer.domElement );

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
