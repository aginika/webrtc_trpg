$(document).ready(function() {
    $("#makeMeScrollable").smoothDivScroll({ 
        mousewheelScrolling: false,
        manualContinuousScrolling: false,
        autoScrollingMode: "onStart",
        autoScrollingStep: 1,
        autoScrollingInterval: 100
    });
});


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
