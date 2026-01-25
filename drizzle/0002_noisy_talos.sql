CREATE TABLE `translation_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceText` text NOT NULL,
	`targetText` text NOT NULL,
	`sourceLang` varchar(50) NOT NULL,
	`targetLang` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`documentType` varchar(100),
	`usageCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_memory_id` PRIMARY KEY(`id`)
);
