const Domain = require('./protocol');

class ChannelManager {

	constructor(agServer, dbManager) {
		this.agServer = agServer
		this.dbManager = dbManager
	}

	async setupGetAllBookingDetailsRPCListener(socket) {
		(async () => {
			for await (let request of socket.procedure(Domain.Procedure.GET_ALL_BOOKING_DETAILS)) {
				try {
					const getAllBookingDetailsResult = await this.dbManager.getAllBookingDetails()
					request.end(getAllBookingDetailsResult);
				}
				catch(err) {
					request.error(err)
				}
			}
		})()
	}

	async setupCreateBookingTransactionRPCListener(socket) {
		(async () => {
			for await (let request of socket.procedure(Domain.Procedure.CREATE_BOOKING)) {
				try {
					let transaction = request.data.payload
					console.log('@@ CREATE_BOOKING transaction', transaction)
					const transactionResult = await this.dbManager.createBookingTransaction(transaction)
					console.log('@@ transactionResult', transactionResult)

					if(transactionResult.status === Domain.TransactionStatus.SUCCESS) {
						transaction.status = transactionResult.status
						transaction.bookingId = transactionResult.bookingId

						this.agServer.exchange.transmitPublish(Domain.Transmit.BOOKING_CONFIRMED_CHANNEL, transaction);

						// bookingRef should be returned to the requesting client only
						transaction.bookingRef = transactionResult.bookingRef
						request.end(transactionResult);

						// TODO: here we could send the transaction detail to a message queue (say RabbitMQ) consumer, to send a confirmation email to the user
						// with the booking details
					}
					else { // Domain.TransactionStatus.FAILURE.
						// We would end up here if the booking could not be completed, for instance if the booked slots were no longer free
						request.end(transactionResult)
					}
				}
				catch(err) {
					request.error(err)
				}
			}
		})()
	}

	async setupCancelBookingRPCListener(socket) {
		(async () => {
			for await (let request of socket.procedure(Domain.Procedure.CANCEL_BOOKING)) {
				try {
					const bookingId = request.data.payload
					const cancelBookingResult = await this.dbManager.cancelBooking(bookingId)

					this.agServer.exchange.transmitPublish(Domain.Transmit.BOOKING_CANCELED_CHANNEL, bookingId);

					request.end(cancelBookingResult);
				}
				catch(err) {
					request.error(err)
				}
			}
		})()
	}
}

module.exports = {
	ChannelManager
}