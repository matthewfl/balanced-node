var config = {
    api: "balanced", // the name of the api object to use
    user: "user",
    secret: "3c49b172ca1611e29e4e026ba7f8ec28",
    // different uris to use
    uri: {
	marketplace: "/v1/marketplaces/TEST-MP1Qgo2GJ01p1Unq365Gq8Hw",
	bankAccount: "/v1/bank_accounts/BA7MzJVqI9vsOl4FGqOowxg4",
	card: "/v1/marketplaces/TEST-MP7KGu1qSh88k1ka9w6FvXZu/cards/CCg1bA1f1o1PEdmOweZjxYy",
	account: "/v1/marketplaces/TEST-MP1Qgo2GJ01p1Unq365Gq8Hw/accounts/ACqnnofIf2xQlmUq12EZ7bh",
	customer: ""
    },



    name: make_selection([ "Johann Bernoulli",
			   "George Washington",
			   "Alan Turing",
			   "Dennis Ritchie"
			 ]),
    routing_number: make_selection(["321174851", "122000030", "021000021"]),
    account_number: make_selection(["9900000001", "2345617845", "9473857386"]),
    card: make_selection(["4111111111111111", "341111111111111", "5105105105105100"]),

    amount: function () {
	return Math.random().toString().substring(2,4) + "00";
    },
    year: function () {
	return (new Date()).getFullYear() + 5 + Math.floor(10 * Math.random());
    },
    month: function () {
	return 1 + Math.floor(Math.random() * 12);
    },

    description: make_selection([ "Renting a bike",
				  "Party Supplies",
				  "Testing balanced"
				], true),
};


function make_selection (arr, rand) {
    var index=0;
    return function () {
	return arr[rand ? Math.floor(arr.length * Math.random()) : index++ % arr.length];
    }
}

var fs = require('fs');
var mu = require('mu2');
var balanced = require('..');

var directories = fs.readdirSync('.');

// remove this file from the list
directories.splice(directories.indexOf('render.js'), 1);
directories.splice(directories.indexOf('peramble.js'), 1);

var peramble = "";

function process_save(dir,definition,request) {
    var result =
	"% if mode == 'definition': \n"
	+ definition + "\n"
	+ "% else:\n"
	+ peramble + "\n"
	+ request + "\n"
	+ "% endif\n";
    fs.writeFile('./'+dir+'/node.mako', result, function(err) {
	if(err)
	    console.log("failed to save "+dir);
	console.log(definition || request ? "Generating " : "Blank ", dir);
    });
}

function process_request (dir, definition) {
    var job = mu.compileAndRender('./'+dir+'/request.js', config);
    var dd = "";
    job.on('data', function(d) {
	dd += d.toString();
    });
    job.on('end', function(request) {
	process_save(dir, definition, dd);
    });
}

function process_dir(dir) {
    fs.readdir('./'+dir, function(err, contents) {
	if(err) return; // was not a directory

	if(contents.indexOf('node.mako')) {
	    contents.splice(contents.indexOf('node.mako'), 1);
	}

	if(contents.indexOf('definition.js') != -1) {
	    var dd = "";
	    var job = mu.compileAndRender('./'+dir+'/definition.js', config);
	    job.on('data', function(d) {
		dd += d.toString();
	    });
	    job.on('end', function(definition) {
		if(contents.indexOf('request.js') != -1) {
		    process_request(dir, dd);
		}else{
		    process_save(dir, dd, "");
		}
	    });
	}else if(contents.indexOf('request.js') != -1) {
	    process_request(dir, "");
	}else{
	    process_save(dir, "", "");
	}
    });
}

function start_generate() {
    var peramble_job = mu.compileAndRender('./peramble.js', config);
    peramble_job.on('data', function(d) {
	peramble += d.toString();
    });

    peramble_job.on('end', function () {
	for(var at = 0; at < directories.length; at++) {
	    process_dir(directories[at]);
	}
    });
}


start_generate();