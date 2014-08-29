var MapPlayer = function(character_name, unique_id, map_x, map_y){
    this.rand_color = function(){
        var r = Math.floor(256*Math.random());
        var g = Math.floor(256*Math.random());
        var b = Math.floor(256*Math.random());
        var a = 0.7;
        return "rgba(" + r + "," + g + "," + b + "," + a+  ")"
    };

    this.unique_id = unique_id;
    this.character_name = character_name;
    this.color = this.rand_color();

    this.map_x = map_x;
    this.map_y = map_y;

    this.update_pos = function(x, y){this.map_x = x;this.map_y = y;};

    this.set_color = function(r,g,b,a){
        return "rgba(" + r + "," + g + "," + b + "," + a+  ")"
    }
};


var Map = function(map_name, user_control){
    this.user_control = user_control;
    this.map_name = map_name;
    this.map_players = {};

    this.min_map_x = 0;
    this.min_map_y = 0;
    this.max_map_x = 400;
    this.max_map_y = 400;

    this.player_init_x = 1;
    this.player_init_y = 1;

    //Create Local User. Other players character will be add by add_exist_map_players
    this.add_new_map_player = function( character_name, unique_id){
        var new_player = new MapPlayer(character_name, unique_id, this.player_init_x, this.player_init_y);
        this.map_players[unique_id] =  new_player ;
    };

    //Add other player(get over network)
    this.add_exist_map_player = function( character_name, unique_id, map_x, map_y ){
        var exist_player = new MapPlayer(character_name, unique_id, map_x, map_y);
        this.map_players[unique_id] =  exist_player ;
    };

    this.set_min_max = function(min_x, min_y, max_x, max_y){
        this.min_map_x = min_x;
        this.min_map_y = min_y;
        this.max_map_x = max_x;
        this.max_map_y = max_y;
    }

    this.set_player_initpos = function(init_x, init_y){
        this.player_init_x = init_x;
        this.player_init_y = init_y;
    }

    this.get_player = function(unique_id){
        var tmp_user = this.map_players[unique_id]
        if(tmp_user == undefined){
            console.log("No User Found");
            return null;
        }
        return tmp_user;
    }

    this.update_player_pos = function( player_unique_id, x, y){
        var target_player = this.get_player(player_unique_id);
        if( target_player != null){
            target_player.update_pos(x,y);
        }
    }
};