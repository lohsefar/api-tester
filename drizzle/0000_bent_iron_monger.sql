CREATE TABLE `accounts` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `endpoints` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `endpoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `endpoints_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `sessions_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3),
	`image` varchar(255),
	`password` varchar(255),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(255) NOT NULL,
	`endpointId` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`headers` json,
	`body` text,
	`queryParams` json,
	`ip` varchar(45),
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `endpoints` ADD CONSTRAINT `endpoints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_endpointId_endpoints_id_fk` FOREIGN KEY (`endpointId`) REFERENCES `endpoints`(`id`) ON DELETE cascade ON UPDATE no action;