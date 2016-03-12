var express =  require('express');
var app = express();
var https = require("https");
var debug = require("debug")("http");

const port = 8080;

//public folder definition
app.use(express.static('public'));

function addStatusApi(api, path) {
    app.get('/'+api.replace("_url",""), function (req, res) {
        debug("in api: "+api.replace("_url",""));
        https.get(path, function (getRes) {
            var resBody = "";
            getRes.on('data',function(data) {
                resBody += data;
            });
            getRes.on('end',function() {
                debug('received object JSON: '+res+'when calling api: '+path);
                res.send(resBody);
            });
        }).on('error',function(err) {
            debug('got error '+ err +'while trying to call api: '+err);
        });
    });
}


function checkType(variable,expectedType) {
    if (typeof variable !== expectedType) {
        debug('encountered bad type in variable,expected %s. received %s',expectedType,typeof variable);
        return false;
    }
    return true;
}

https.get('https://status.github.com/api.json', function(apiList) {
    if (apiList.statusCode != 200) {
        res.statusCode = apiList.statusCode;
        res.errorMessage = 'got error code ' + apiList.statusCode +'while trying to get gitHub api list.';
        res.end();
    }
    apiList.on("data",function(data) {
        debug('received api list json: ' + data);
        var apis = JSON.parse(data);
        if (!checkType(apis,"object")) return;
        //going over all api in the list and for each one adding route to our RESTful api.
        for (var api in apis) {
            if (apis.hasOwnProperty(api)) {
                var path = apis[api];
                if (!checkType(path,"string")) return;
                addStatusApi(api, path);
            }
        }
    });
}).on('error', function(e) {
    debug('Got error: '+e+' while calling http.get on GitHub api list');
});

var server = app.listen(port, function () {
    debug("GitHub Status server app listening at port %s",port);
});