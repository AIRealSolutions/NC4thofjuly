CREATE TABLE `marshal_pins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`pin` varchar(8) NOT NULL,
	`label` varchar(128) NOT NULL,
	`checkpointId` int,
	`marshalName` varchar(256),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marshal_pins_id` PRIMARY KEY(`id`)
);
