const http = require('http')
const eetase = require('eetase')
const socketClusterServer = require('socketcluster-server')
const uuid = require('uuid')
const sccBrokerClient = require('scc-broker-client')
const ChannelManager = require('./channel.manager').ChannelManager
const DbManager = require('./db.manager').DbManager
const AuthMiddleware = require('./auth.middleware').AuthMiddleware

const ENVIRONMENT = process.env.ENV || 'dev'
const SOCKETCLUSTER_PORT = process.env.SOCKETCLUSTER_PORT || 8000
const SOCKETCLUSTER_WS_ENGINE = process.env.SOCKETCLUSTER_WS_ENGINE || 'ws'
const SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT = Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT) || 1000
const SOCKETCLUSTER_LOG_LEVEL = process.env.SOCKETCLUSTER_LOG_LEVEL || 2
const SCC_INSTANCE_ID = uuid.v4()

let agOptions = {}
if (process.env.SOCKETCLUSTER_OPTIONS) {
  let envOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS)
  Object.assign(agOptions, envOptions)
}

const httpServer = eetase(http.createServer())
const agServer = socketClusterServer.attach(httpServer, agOptions)
const dbManager = new DbManager()
const channelManager = new ChannelManager(agServer, dbManager)
const authMiddleware = new AuthMiddleware(agServer);

/**
 * SocketCluster connections handling loop */
(async () => {
  for await (let {socket} of agServer.listener('connection')) {

		console.log('@@ received a socket connection', socket.id)
		await channelManager.setupGetAllBookingDetailsRPCListener(socket)
		await channelManager.setupCreateBookingTransactionRPCListener(socket)
		await channelManager.setupCancelBookingRPCListener(socket)
  }
})()

httpServer.listen(SOCKETCLUSTER_PORT);

if (SOCKETCLUSTER_LOG_LEVEL >= 1) {
  (async () => {
    for await (let {error} of agServer.listener('error')) {
      console.error(error)
    }
  })()
}

if (SOCKETCLUSTER_LOG_LEVEL >= 2) {
  console.log(
    `   ${colorText('[Active]', 32)} SocketCluster worker with PID ${process.pid} is listening on port ${SOCKETCLUSTER_PORT}`
  );

  (async () => {
    for await (let {warning} of agServer.listener('warning')) {
      console.warn(warning)
    }
  })()
}

function colorText(message, color) {
  if (color) {
    return `\x1b[${color}m${message}\x1b[0m`
  }
  return message
}