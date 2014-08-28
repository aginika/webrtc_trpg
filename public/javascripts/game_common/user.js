/* Generate UID*/
var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

/* Generate Random Light Color*/
var new_light_color = function(){
    function range_random(){
        return Math.floor((256-201)*Math.random());
    }
    return 'rgb(' + ( range_random()+ 200) + ',' + 
        (range_random() + 200) + ',' + 
        (range_random() + 200) + ')';
};


// User Class
var User = function(user_id, properties, unique_id){
    this.user_id = user_id;
    this.user_properties = properties;
    if (typeof unique_id === "undefined")
        this.unique_id = guid();
    else
        this.unique_id = unique_id;
    this.user_color = new_light_color();
}

// UserManager Class
var UserManager = function(){
    this.user_list = {};

    this.add_user = function(user){
        console.log("add user : " + user.unique_id + " name : " + user.user_id);
        this.user_list[user.unique_id] = user;
    };

    this.delete_user = function(user_unique_id){
        delete this.user_list[user_unique_id];
    }

    this.find_user = function(user_unique_id){
        return this.user_list[user_unique_id];
    }
}
