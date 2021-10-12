
CREATE DATABASE coladays;

USE coladays;

CREATE TABLE `tbl_booking` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `booking_ref` varchar(36) NOT NULL DEFAULT '',
  `user_id` varchar(30) NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tbl_booking_details` (
  `booking_id` int(10) unsigned NOT NULL,
  `room` varchar(3) NOT NULL DEFAULT '',
  `hour` int(11) NOT NULL,
  PRIMARY KEY (`room`,`hour`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `tbl_booking_details_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `tbl_booking` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

