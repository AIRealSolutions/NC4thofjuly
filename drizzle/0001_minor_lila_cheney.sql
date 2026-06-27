CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(256) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`performedBy` varchar(256),
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `committee_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`role` varchar(256) NOT NULL,
	`committee` varchar(256),
	`yearStart` int NOT NULL,
	`yearEnd` int,
	`bio` text,
	`photoUrl` varchar(512),
	`email` varchar(320),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `committee_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`type` enum('attendee','volunteer') NOT NULL DEFAULT 'attendee',
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`partySize` int DEFAULT 1,
	`notes` text,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_signups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`shortDescription` varchar(512),
	`category` enum('parade','ceremony','entertainment','arts','sports','family','ball','fireworks','other') NOT NULL DEFAULT 'other',
	`eventDate` timestamp,
	`endDate` timestamp,
	`location` varchar(256),
	`imageUrl` varchar(512),
	`allowSignup` boolean NOT NULL DEFAULT true,
	`allowVolunteer` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `festival_queens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`year` int NOT NULL,
	`title` varchar(256) DEFAULT 'Festival Queen',
	`bio` text,
	`photoUrl` varchar(512),
	`hometown` varchar(256),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `festival_queens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parade_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`isReturning` boolean NOT NULL DEFAULT false,
	`year` int NOT NULL,
	`entryName` varchar(256) NOT NULL,
	`entryType` enum('float','marching_band','vehicle','walking_group','equestrian','other') NOT NULL DEFAULT 'other',
	`description` text,
	`contactFirstName` varchar(128) NOT NULL,
	`contactLastName` varchar(128) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(32),
	`organization` varchar(256),
	`estimatedLength` varchar(64),
	`numberOfPeople` int,
	`requiresElectricity` boolean NOT NULL DEFAULT false,
	`specialRequirements` text,
	`stagingZone` varchar(64),
	`parkingSpots` int DEFAULT 1,
	`status` enum('pending','approved','rejected','waitlisted') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parade_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `past_presidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`yearStart` int NOT NULL,
	`yearEnd` int,
	`bio` text,
	`photoUrl` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `past_presidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` varchar(512),
	`isMilestone` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','committee') NOT NULL DEFAULT 'user';