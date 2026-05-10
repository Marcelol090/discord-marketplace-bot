CREATE TABLE `clickAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` varchar(64),
	`action` varchar(64) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clickAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `embedVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` varchar(255) NOT NULL,
	`variantName` varchar(255) NOT NULL,
	`embedData` json NOT NULL,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `embedVariants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `paymentTransactions` DROP INDEX `paymentTransactions_externalId_unique`;--> statement-breakpoint
ALTER TABLE `paymentTransactions` MODIFY COLUMN `provider` enum('stripe','pix') NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentTransactions` MODIFY COLUMN `status` enum('pending','succeeded','failed','cancelled') NOT NULL;--> statement-breakpoint
ALTER TABLE `botConfigs` ADD `showcaseChannelId` varchar(64);--> statement-breakpoint
ALTER TABLE `botConfigs` ADD `announcementChannelId` varchar(64);--> statement-breakpoint
ALTER TABLE `botConfigs` ADD `promotionChannelId` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryStatus` enum('pending','sent','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `lastDeliveryAttempt` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `assetKey` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `isDigital` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `clickAnalytics` ADD CONSTRAINT `clickAnalytics_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `clickAnalytics_productId_idx` ON `clickAnalytics` (`productId`);--> statement-breakpoint
CREATE INDEX `clickAnalytics_userId_idx` ON `clickAnalytics` (`userId`);--> statement-breakpoint
CREATE INDEX `embedVariants_testId_idx` ON `embedVariants` (`testId`);--> statement-breakpoint
CREATE INDEX `orders_deliveryStatus_idx` ON `orders` (`deliveryStatus`);