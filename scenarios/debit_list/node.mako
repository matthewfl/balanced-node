% if mode == 'definition': 
balanced.marketplaces.debits

% else:
<%!
    import json

    def to_json( d ):
        return json.dumps( d , indent=4)
%>

var balanced = require('balanced-official');

balanced.configure('${ctx.api_key}');

balanced.marketplaces.debits

% endif
