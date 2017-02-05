
let express = require('express'),
  app = express(),
  root = process.cwd();

let openConnections = [];

app.use(express.static(root + '/web'));

//emit or broadcast "server sent event(SSE)"
app.get('/stream', function(req, res) {
  console.log('request -> /stream');

  req.socket.setTimeout(0x7FFFFFFF);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  openConnections.push(res);  

  req.on('close', function() {
    for(var j = 0; j < openConnections.length; j++) {
      if(openConnections[j] === res) {
        break;
      }
    }
    openConnections.splice(j, 1);
    console.log("close -> ",openConnections.length);
  });

});

setInterval(function() {
  let msg = createMsg();
  
  openConnections.forEach(function(res) {
    res.write('data:' + msg + '\n\n'); // Note the extra newline
  });
}, 1000);

function createMsg() {
  let msg = [];
  let x = (new Date()).getTime();

  for(let i = 0; i < 6; i ++) {
    msg.push({x:x, y: (Math.round(Math.random() * 60) + 40)});
  }

  return JSON.stringify(msg);
}

app.listen(3000, function() {
  console.log('Listening on port 3000...');
});