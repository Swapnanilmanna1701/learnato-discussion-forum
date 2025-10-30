DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "author" TO "author" text;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `posts` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `replies` ALTER COLUMN "author" TO "author" text;--> statement-breakpoint
ALTER TABLE `replies` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `user` ADD `bio` text;