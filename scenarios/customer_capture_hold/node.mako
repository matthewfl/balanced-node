% if mode == 'definition': 
balanced.Holds.capture

% else:
<%!
    import json

    def to_json( d ):
        return json.dumps( d , indent=4)
%>

var balanced_library = require('balanced');

var balanced = new balanced_library({
    marketplace_uri: "${ctx.marketplace_uri}",
    secret: "${ctx.api_key}"
});

balanced.Holds.capture("${request['uri'] or request['hold_uri']}", { amount: "${payload['amount'] if payload else request['amount'] or '1100'}" },
		      function(err, result) {
    /* . . . */
});

% endif
