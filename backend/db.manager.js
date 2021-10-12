const mysql = require('mysql2/promise');
const uuid = require('uuid');
const Domain = require('./protocol');


class DbManager {

	constructor() {

		this.connectionPool = mysql.createPool({
			host            	: 'host.docker.internal',
			port							: 3306,
			user            	: 'root',
			password        	: 'root',
			database        	: 'coladays',
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
		})
	}

	async getAllBookingDetails() {

		const sql = `SELECT tbl_booking.id, tbl_booking.user_id as userId, tbl_booking_details.room, tbl_booking_details.hour FROM tbl_booking JOIN tbl_booking_details ON tbl_booking.id = tbl_booking_details.booking_id;`
		return await this.connectionPool.execute(sql)
	}

	async cancelBooking(bookingId) {

		const sql = `DELETE FROM tbl_booking WHERE id = ${bookingId};`
		return await this.connectionPool.execute(sql)
	}

	/**
	 {
		 userId: string
		 fromTime: int,
		 toTime: int,
		 roomId: string
	 }
	 * @param transaction
	 * @returns {Promise<void>}
	 */
	async createBookingTransaction(transaction) {

		console.log('@@ createBookingTransaction transaction', transaction)

		const connection = await this.connectionPool.getConnection()
		await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED;');

		// Begin the transaction
		await connection.beginTransaction();
		try {
			// we need a booking_ref <-- generate a UUID
			// we need a user_id <-- coming from the payload
			const bookingRef = uuid.v4()

			// Insert a new record in the tbl_booking master table
			const addBooking =
				await connection.execute('INSERT INTO tbl_booking(booking_ref, user_id) VALUES (?, ?);', [bookingRef, transaction.userId]);
			// the new booking id
			const addBookingInsertId = addBooking?.[0]?.insertId

			// Create a row for each 1h unit slot in the dependent table
			const bookingHourDetails = []
			for (let i = transaction.fromTime ; i < transaction.toTime ; i++) {
				bookingHourDetails.push([ addBookingInsertId, transaction.roomId, i ])
			}

			const sqlValues = bookingHourDetails
				.map(_ => `(${_[0]}, '${_[1]}', ${_[2]})`)
				.join(',')

			const insertDetailsSQL = `INSERT INTO tbl_booking_details (booking_id, room, hour) VALUES ${sqlValues};`
			await connection.execute(insertDetailsSQL)

			// Committing to the Db
			await connection.commit();

			return {
				status: Domain.TransactionStatus.SUCCESS,
				bookingId: addBookingInsertId,
				bookingRef: bookingRef
			}

		} catch (err) {

			console.error(`Error occurred while creating booking ${err.message}`, err);
			console.info('@@ Rolling back the transaction.');
			await connection.rollback();
			return {
				status: Domain.TransactionStatus.FAILURE,
				error: err
			}
		}
	}
}

module.exports = {
	DbManager
}