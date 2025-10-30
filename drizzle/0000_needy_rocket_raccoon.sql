CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author` text NOT NULL,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`content` text NOT NULL,
	`author` text NOT NULL,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`parent_reply_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_reply_id`) REFERENCES `replies`(`id`) ON UPDATE no action ON DELETE no action
);
