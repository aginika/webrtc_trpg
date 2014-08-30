var DiceEmulater = function(){

    //This Assumed below
    // ( ) are not used.
    // all arguments are  connected with "+"
    this.parse = function( dice_string_data ){
        //delete spaces
        dice_string_data = dice_string_data.replace(/\s+/g, '');
        items  = dice_string_data.split("+");

        console.log(items);
        var offset = 0;
        var dices = [];
        for(var index in items){
            var item = items[index];
            var search_D_index = item.search("D");
            var search_d_index = item.search("d");
            console.log(" D : " + search_D_index);
            console.log(" d : " + search_d_index);
            if ( search_D_index == -1 && search_d_index == -1){
                console.log("Seemd to be a number");
                //This Item be offset
                var item_value = Number(item);
                if(!isNaN(item_value)){
                    offset += item_value;
                }else{
                    console.log("Error parse item is nan :" + item);
                }
            }else if( search_D_index < item.length || search_D_index < item.length){
                console.log("Detect D");
                if(search_D_index != -1){
                    var num_face = item.split("D");
                }else if(search_d_index != -1){
                    var num_face = item.split("d");
                }
                console.log("Num Face:");
                console.log(num_face);
                dices.push({num: Number(num_face[0]), face: Number(num_face[1])});
            }else{
                console.log("dice parse error");
                return item;
            }
        }
        return {dices : dices, offset : offset};
    }

    this.estimate_max_min = function(){
        var min = this.offset;
        var max = this.offset;
        for (var index in this.dices){
            var dice = this.dices[index];
            min += dice.num;
            console.log("face  : " + dice.face);
            console.log("num  : " + dice.num);
            max += dice.face * dice.num;
        }
        console.log("max : " + max);
        return {min: min, max: max};
    }

    this.init = function( dice_infos ){
        this.dice_string_data = dice_infos.dice_string_data;
        var dice_infos_parsed = this.parse( dice_infos.dice_string_data );

        console.log(dice_infos_parsed);
        if ( typeof dice_infos_parsed.dices == "undefined")
            return "error in DiceEmulater Init :" + dice_infos_parsed;

        this.dices = dice_infos_parsed.dices;
        this.offset = dice_infos_parsed.offset;

        if(typeof dice_infos.threshold != "undefined"){
            this.threshold = dice_infos.threshold;
            this.dice_type = "Judge";
        }else{
            this.dice_type = "Sum";
        }

        //floor or round
        if(typeof dice_infos.error_manip_func != "undefined"){
            this.error_manip_func = dice_infos.error_manip_func;
        }else{
            this.error_manip_func = Math.floor;
        }

        //return estimated max and min value
        return this.estimate_max_min();
    }

    this.calc = function(){
        var sum = this.offset;
        var dice_logs = [];
        for (var dice_index in this.dices){
            var dice = this.dices[dice_index];
            var tmp_sum = 0;
            var dice_log = [];
            for (var index  = 0; index < dice.num; index++){
                var rand_val = this.error_manip_func(
                    (Math.random() * dice.face + 1));
                tmp_sum += rand_val;
                dice_log.push({index : index, face : dice.face, result: rand_val});
            }
            sum += tmp_sum;
            dice_logs.push(dice_log);
        }

        if(this.dice_type == "Sum"){
            return {
                result: sum,
                dice_logs: dice_logs,
                dice_string: this.dice_string_data
            };
        }else if(this.dice_types == "Judge"){
            var judge_result = this.threshold > sum ? true : false
            return {
                judge_result: judge_result,
                result: sum,
                dice_logs: dice_logs,
                dice_string: this.dice_string_data
            };
        }

    }

}