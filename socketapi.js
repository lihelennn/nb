const io = require( "socket.io" )();
const socketapi = {
    io: io
};

let connections = 0 
let dict = {}
let classDraftLocationsDict = {}
let userLocationsDict = {}
// Add your socket.io logic here!
io.on('connection', function( socket ) {
  io.emit('connections', connections)

  socket.on('joined', function(username) {
    console.log(username + " joined!")
    connections+=1
    // io.emit('connections', connections)
    // io.emit('joined', username)
    io.emit('user-location', JSON.stringify(userLocationsDict))
  })

  socket.on('chat-message', function(data) {
    io.emit('chat-message', data)
    // TODO: send chat messages to the server
  })

  socket.on('typing', function(username) {
    io.emit('typing', username)
  })

  socket.on('stopTyping', function() {
    io.emit('stopTyping')
  })

  socket.on('leave', function(username) {
    console.log("leaving")
    connections-=1
    if (connections < 0) {
      connections = 0;
    }
    io.emit('leave', username)
    io.emit('connections', connections)
  })

  socket.on('thread-typing', function(data) { 
    if (data.threadId in dict) {
      dict[data.threadId].add(data.username)
    } else {
      dict[data.threadId] = new Set([data.username])
    }
    io.emit('thread-typing', data.threadId)
  })

  socket.on('thread-stop-typing', function(data) { 
    if (data.threadId in dict) {
      dict[data.threadId].delete(data.username)
      if (dict[data.threadId].size == 0) {
        io.emit('thread-stop-typing', data.threadId)
      }
    }
  })

  // socket.on('new-draft', function(data) {
  //   console.log(data.range)
  //   io.emit('new-draft', data)
    // if (data.classId in classDraftLocationsDict) {
    //   classDraftLocationsDict[data.classId].add(data.range)
    // } else {
    //   classDraftLocationsDict[data.classId] = new Set([data.range])
    // }
    // io.emit('new-draft', {classId: data.classId, classDrafts: Array.from(classDraftLocationsDict[data.classId])})
    // console.log({classId: data.classId, classDrafts: classDraftLocationsDict[data.classId]})
  // })

  socket.on('user-location', function(data) {
    userLocationsDict[data.username] = {"location": [data.x, data.y], "dimensions": [data.docWidth, data.docHeight]}
    // userLocationsDict[data.username]["location"] = [data.x, data.y]
    // userLocationsDict[data.username]["dimensions"] = [data.docWidth, data.docHeight]
    io.emit('user-location', JSON.stringify(userLocationsDict))
  })

  socket.on('new-thread', function(data) {
    io.emit('new-thread', data)
  })

});

module.exports = socketapi;