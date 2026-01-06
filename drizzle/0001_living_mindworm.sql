CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` varchar(255),
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`currency` enum('LBP','USDT') NOT NULL,
	`amount` decimal(20,8) NOT NULL DEFAULT '0',
	`lockedAmount` decimal(20,8) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchangeRates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromCurrency` enum('LBP','USDT') NOT NULL,
	`toCurrency` enum('LBP','USDT') NOT NULL,
	`rate` decimal(20,8) NOT NULL,
	`source` varchar(100),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchangeRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionHash` varchar(255),
	`fromWalletId` int NOT NULL,
	`toWalletId` int NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`currency` enum('LBP','USDT') NOT NULL,
	`fee` decimal(20,8) NOT NULL DEFAULT '0',
	`status` enum('PENDING','CONFIRMED','FAILED') NOT NULL DEFAULT 'PENDING',
	`transactionType` enum('TRANSFER','DEPOSIT','WITHDRAWAL','EXCHANGE') NOT NULL,
	`description` text,
	`blockchainConfirmations` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionHash_unique` UNIQUE(`transactionHash`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAddress` varchar(255) NOT NULL,
	`walletType` enum('LBP_DIGITAL','USDT','HYBRID') NOT NULL DEFAULT 'HYBRID',
	`publicKey` text NOT NULL,
	`encryptedPrivateKey` text NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_walletAddress_unique` UNIQUE(`walletAddress`)
);
