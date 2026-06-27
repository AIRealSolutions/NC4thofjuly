CREATE TABLE `parade_checkpoint_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`checkpointId` int NOT NULL,
	`marshalName` varchar(256),
	`passedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	CONSTRAINT `parade_checkpoint_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parade_checkpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`shortName` varchar(64) NOT NULL,
	`description` varchar(512),
	`streetAddress` varchar(256),
	`lat` varchar(32),
	`lng` varchar(32),
	`routeOrder` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parade_checkpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parade_session` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`status` enum('setup','staging','active','completed') NOT NULL DEFAULT 'setup',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`currentUnitId` int,
	`totalUnits` int DEFAULT 0,
	`unitsCompleted` int DEFAULT 0,
	`averageGapSeconds` int DEFAULT 90,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parade_session_id` PRIMARY KEY(`id`),
	CONSTRAINT `parade_session_year_unique` UNIQUE(`year`)
);
--> statement-breakpoint
CREATE TABLE `parade_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`unitNumber` int NOT NULL,
	`participantId` int,
	`unitName` varchar(256) NOT NULL,
	`entryType` varchar(64) NOT NULL DEFAULT 'other',
	`contactName` varchar(256),
	`contactPhone` varchar(32),
	`stagingZone` varchar(128),
	`stagingSpot` varchar(64),
	`status` enum('staged','called','marching','completed','scratched') NOT NULL DEFAULT 'staged',
	`calledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parade_units_id` PRIMARY KEY(`id`)
);
