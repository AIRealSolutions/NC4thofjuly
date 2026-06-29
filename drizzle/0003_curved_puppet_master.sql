ALTER TABLE `parade_participants` MODIFY COLUMN `entryType` enum('float','marching_band','vehicle','walking_group','equestrian','shriners','other') NOT NULL DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `parade_participants` ADD `shrinersTempleName` varchar(256);--> statement-breakpoint
ALTER TABLE `parade_participants` ADD `shrinersUnitType` enum('mini_cars','motorcycles','clown_unit','marching','color_guard','band','go_karts','other');--> statement-breakpoint
ALTER TABLE `parade_participants` ADD `shrinersVehicleCount` int;--> statement-breakpoint
ALTER TABLE `parade_participants` ADD `shrinersSpecialEquipment` text;