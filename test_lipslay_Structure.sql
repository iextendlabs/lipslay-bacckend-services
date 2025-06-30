CREATE TABLE `affiliates` (
  `id` bigint UNSIGNED NOT NULL,
  `membership_plan_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `commission` varchar(255) DEFAULT NULL,
  `fix_salary` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expire` varchar(255) DEFAULT NULL,
  `display_type` varchar(255) DEFAULT '1',
  `number` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `parent_affiliate_id` bigint UNSIGNED DEFAULT NULL,
  `parent_affiliate_commission` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1'
) ;

CREATE TABLE `affiliate_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `affiliate_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `commission` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `commission_type` enum('fixed','percentage') NOT NULL DEFAULT 'percentage'
) ;

CREATE TABLE `affiliate_services` (
  `id` bigint UNSIGNED NOT NULL,
  `affiliate_category_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `commission_type` enum('fixed','percentage') NOT NULL,
  `commission` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `assistant_supervisor_to_supervisors` (
  `supervisor_id` bigint NOT NULL,
  `assistant_supervisor_id` bigint NOT NULL
) ;

CREATE TABLE `bids` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `quote_id` bigint UNSIGNED NOT NULL,
  `bid_amount` decimal(10,2) NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `bid_chats` (
  `id` bigint UNSIGNED NOT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  `bid_id` bigint UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `file` tinyint(1) NOT NULL DEFAULT '0',
  `location` tinyint(1) NOT NULL DEFAULT '0'
) ;

CREATE TABLE `bid_images` (
  `id` bigint UNSIGNED NOT NULL,
  `bid_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `campaigns` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `cash_collections` (
  `id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `staff_id` bigint UNSIGNED DEFAULT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `chats` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `admin_id` bigint UNSIGNED DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `complaints` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(255) NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `complaint_chats` (
  `id` bigint UNSIGNED NOT NULL,
  `text` text NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `complaint_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `coupons` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `discount` decimal(8,2) NOT NULL,
  `date_start` date NOT NULL,
  `date_end` date NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `uses_total` int DEFAULT NULL,
  `min_order_value` decimal(10,2) DEFAULT '0.00',
  `coupon_for` enum('public','customer') NOT NULL DEFAULT 'public'
) ;

CREATE TABLE `coupon_histories` (
  `id` bigint UNSIGNED NOT NULL,
  `coupon_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `discount_amount` decimal(8,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `coupon_to_category` (
  `id` bigint UNSIGNED NOT NULL,
  `coupon_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `coupon_to_service` (
  `id` bigint UNSIGNED NOT NULL,
  `coupon_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `crms` (
  `id` bigint UNSIGNED NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `accountId` bigint UNSIGNED DEFAULT NULL,
  `pipelineId` bigint UNSIGNED DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL
) ;

CREATE TABLE `currencies` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `customer_coupons` (
  `id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `coupon_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `customer_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `buildingName` varchar(255) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `flatVilla` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `drivers` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `commission` varchar(255) DEFAULT NULL,
  `affiliate_id` bigint UNSIGNED DEFAULT NULL
) ;

CREATE TABLE `driver_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

CREATE TABLE `faqs` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT '1'
) ;

CREATE TABLE `holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `date` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `information` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ;

CREATE TABLE `long_holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `date_start` date NOT NULL,
  `date_end` date NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `membership_plans` (
  `id` bigint UNSIGNED NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `membership_fee` decimal(8,2) NOT NULL,
  `expire` varchar(255) NOT NULL,
  `status` tinyint NOT NULL,
  `type` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL
) ;

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `total_amount` decimal(8,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `affiliate_id` bigint UNSIGNED DEFAULT NULL,
  `buildingName` varchar(255) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `landmark` varchar(255) NOT NULL,
  `flatVilla` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) NOT NULL,
  `service_staff_id` bigint UNSIGNED DEFAULT NULL,
  `staff_name` varchar(255) DEFAULT NULL,
  `date` varchar(255) NOT NULL,
  `time_slot_id` bigint UNSIGNED DEFAULT NULL,
  `time_slot_value` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `order_comment` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `driver_status` varchar(255) DEFAULT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `order_source` varchar(255) DEFAULT NULL,
  `currency_symbol` varchar(255) DEFAULT NULL,
  `currency_rate` decimal(10,2) DEFAULT NULL
) ;

CREATE TABLE `order_attachments` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `order_chats` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `order_comments` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `order_histories` (
  `id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `user` varchar(255) NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `order_services` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `price` varchar(255) NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `option_id` varchar(255) DEFAULT NULL,
  `option_name` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `order_totals` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `sub_total` varchar(255) NOT NULL,
  `staff_charges` varchar(255) DEFAULT NULL,
  `transport_charges` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `discount` decimal(8,2) NOT NULL DEFAULT '0.00'
) ;

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `quotes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `detail` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `bid_id` bigint UNSIGNED DEFAULT NULL,
  `sourcing_quantity` int DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `affiliate_id` bigint UNSIGNED DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `quote_category` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `quote_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `quote_images` (
  `id` bigint UNSIGNED NOT NULL,
  `quote_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `quote_options` (
  `id` bigint UNSIGNED NOT NULL,
  `quote_id` bigint UNSIGNED NOT NULL,
  `option_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `quote_staff` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `quote_id` bigint UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `quote_amount` decimal(10,2) DEFAULT NULL,
  `quote_commission` decimal(10,2) DEFAULT NULL
) ;

CREATE TABLE `reviews` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED DEFAULT NULL,
  `service_id` bigint UNSIGNED DEFAULT NULL,
  `content` text NOT NULL,
  `rating` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `video` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `review_images` (
  `id` bigint UNSIGNED NOT NULL,
  `review_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `services` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext,
  `short_description` longtext,
  `price` varchar(255) NOT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `discount` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT '1',
  `type` varchar(255) DEFAULT NULL,
  `quote` int NOT NULL DEFAULT '0',
  `pipelineId` bigint UNSIGNED DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `slug` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `service_add_ons` (
  `service_id` bigint UNSIGNED NOT NULL,
  `add_on_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `service_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT '1',
  `icon` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT 'Female',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `slug` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `service_images` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `service_options` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `option_name` varchar(255) NOT NULL,
  `option_price` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `option_duration` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `service_packages` (
  `service_id` bigint UNSIGNED NOT NULL,
  `package_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `service_to_category` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `service_to_user_notes` (
  `id` bigint UNSIGNED NOT NULL,
  `service_id` varchar(255) NOT NULL,
  `note` varchar(255) NOT NULL,
  `user_ids` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `service_variants` (
  `service_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `settings` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `short_holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `hours` int NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `start_time_to_sec` int NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT '1'
) ;

CREATE TABLE `staff` (
  `id` bigint UNSIGNED NOT NULL,
  `membership_plan_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `commission` varchar(255) DEFAULT NULL,
  `fix_salary` decimal(8,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `charges` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `instagram` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `snapchat` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `tiktok` varchar(255) DEFAULT NULL,
  `about` text,
  `sub_title` varchar(255) DEFAULT NULL,
  `driver_id` bigint UNSIGNED DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `min_order_value` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `affiliate_id` bigint UNSIGNED DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `online` tinyint(1) NOT NULL DEFAULT '1',
  `get_quote` tinyint(1) NOT NULL DEFAULT '0',
  `quote_amount` decimal(10,2) DEFAULT NULL,
  `quote_commission` decimal(10,2) DEFAULT NULL,
  `show_quote_detail` tinyint(1) NOT NULL DEFAULT '0'
) ;

CREATE TABLE `staff_drivers` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `day` varchar(255) NOT NULL,
  `time_slot_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_general_holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `day` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_group_driver` (
  `id` bigint UNSIGNED NOT NULL,
  `driver_id` bigint UNSIGNED NOT NULL,
  `staff_group_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_group_staff_zone` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_group_id` bigint UNSIGNED NOT NULL,
  `staff_zone_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_group_to_staff` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `staff_group_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_holidays` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_images` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_sub_title` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `sub_title_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_supervisor` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `supervisor_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_to_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_to_services` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `service_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_youtube_videos` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `youtube_video` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `staff_zones` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `transport_charges` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `extra_charges` varchar(255) DEFAULT NULL,
  `currency_id` bigint UNSIGNED DEFAULT NULL
) ;

CREATE TABLE `sub_titles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `supervisor_to_managers` (
  `supervisor_id` bigint UNSIGNED NOT NULL,
  `manager_id` bigint UNSIGNED NOT NULL
) ;

CREATE TABLE `time_slots` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `date` date DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `group_id` bigint UNSIGNED DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `start_time_to_sec` int NOT NULL,
  `end_time_to_sec` int NOT NULL,
  `seat` int DEFAULT '1'
) ;

CREATE TABLE `time_slot_to_staff` (
  `id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `time_slot_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

CREATE TABLE `transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `description` text
) ;

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `device_token` varchar(255) DEFAULT NULL,
  `last_notification_id` varchar(255) DEFAULT NULL,
  `customer_source` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT '1',
  `affiliate_program` varchar(255) DEFAULT NULL,
  `freelancer_program` varchar(255) DEFAULT NULL,
  `last_login_time` timestamp NULL DEFAULT NULL,
  `login_source` varchar(50) DEFAULT NULL
) ;

CREATE TABLE `user_affiliate` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `affiliate_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `commission` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `display` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `user_documents` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `address_proof` varchar(255) DEFAULT NULL,
  `noc` varchar(255) DEFAULT NULL,
  `id_card_front` varchar(255) DEFAULT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `driving_license` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `other` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `id_card_back` varchar(255) DEFAULT NULL
) ;

CREATE TABLE `withdraws` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `account_detail` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

ALTER TABLE `affiliates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliates_user_id_foreign` (`user_id`),
  ADD KEY `affiliates_membership_plan_id_foreign` (`membership_plan_id`),
  ADD KEY `affiliates_parent_affiliate_id_foreign` (`parent_affiliate_id`);
ALTER TABLE `affiliate_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_categories_affiliate_id_foreign` (`affiliate_id`),
  ADD KEY `affiliate_categories_category_id_foreign` (`category_id`);
ALTER TABLE `affiliate_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_services_affiliate_category_id_foreign` (`affiliate_category_id`),
  ADD KEY `affiliate_services_service_id_foreign` (`service_id`);
ALTER TABLE `bids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bids_staff_id_foreign` (`staff_id`),
  ADD KEY `bids_quote_id_foreign` (`quote_id`);
ALTER TABLE `bid_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bid_chats_sender_id_foreign` (`sender_id`),
  ADD KEY `bid_chats_bid_id_foreign` (`bid_id`);
ALTER TABLE `bid_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bid_images_bid_id_foreign` (`bid_id`);
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `cash_collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cash_collections_order_id_foreign` (`order_id`),
  ADD KEY `cash_collections_staff_id_foreign` (`staff_id`);
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chats_user_id_foreign` (`user_id`),
  ADD KEY `chats_admin_id_foreign` (`admin_id`);
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaints_user_id_foreign` (`user_id`),
  ADD KEY `complaints_order_id_foreign` (`order_id`);
ALTER TABLE `complaint_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_chats_user_id_foreign` (`user_id`),
  ADD KEY `complaint_chats_complaint_id_foreign` (`complaint_id`);
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `coupon_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coupon_histories_coupon_id_foreign` (`coupon_id`),
  ADD KEY `coupon_histories_order_id_foreign` (`order_id`),
  ADD KEY `coupon_histories_customer_id_foreign` (`customer_id`);
ALTER TABLE `coupon_to_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coupon_to_category_coupon_id_foreign` (`coupon_id`),
  ADD KEY `coupon_to_category_category_id_foreign` (`category_id`);
ALTER TABLE `coupon_to_service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coupon_to_service_coupon_id_foreign` (`coupon_id`),
  ADD KEY `coupon_to_service_service_id_foreign` (`service_id`);
ALTER TABLE `crms`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currencies_name_unique` (`name`);
ALTER TABLE `customer_coupons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_coupons_customer_id_foreign` (`customer_id`),
  ADD KEY `customer_coupons_coupon_id_foreign` (`coupon_id`);
ALTER TABLE `customer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_profiles_user_id_foreign` (`user_id`);
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `drivers_user_id_foreign` (`user_id`),
  ADD KEY `drivers_affiliate_id_foreign` (`affiliate_id`);
ALTER TABLE `driver_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_orders_order_id_foreign` (`order_id`),
  ADD KEY `driver_orders_driver_id_foreign` (`driver_id`);
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faqs_category_id_foreign` (`category_id`),
  ADD KEY `faqs_service_id_foreign` (`service_id`);
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `information`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);
ALTER TABLE `long_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `long_holidays_staff_id_foreign` (`staff_id`);
ALTER TABLE `membership_plans`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`),
  ADD KEY `notifications_order_id_foreign` (`order_id`);
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_customer_id_foreign` (`customer_id`),
  ADD KEY `orders_affiliate_id_foreign` (`affiliate_id`),
  ADD KEY `orders_service_staff_id_foreign` (`service_staff_id`),
  ADD KEY `orders_time_slot_id_foreign` (`time_slot_id`),
  ADD KEY `orders_driver_id_foreign` (`driver_id`);
ALTER TABLE `order_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_attachments_order_id_foreign` (`order_id`);
ALTER TABLE `order_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_chats_user_id_foreign` (`user_id`),
  ADD KEY `order_chats_order_id_foreign` (`order_id`);
ALTER TABLE `order_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_comments_order_id_foreign` (`order_id`),
  ADD KEY `order_comments_user_id_foreign` (`user_id`);
ALTER TABLE `order_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_histories_order_id_foreign` (`order_id`);
ALTER TABLE `order_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_services_order_id_foreign` (`order_id`),
  ADD KEY `order_services_service_id_foreign` (`service_id`);
ALTER TABLE `order_totals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_totals_order_id_foreign` (`order_id`);
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotes_user_id_foreign` (`user_id`),
  ADD KEY `quotes_service_id_foreign` (`service_id`),
  ADD KEY `quotes_bid_id_foreign` (`bid_id`),
  ADD KEY `quotes_affiliate_id_foreign` (`affiliate_id`);
ALTER TABLE `quote_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_category_category_id_foreign` (`category_id`),
  ADD KEY `quote_category_quote_id_foreign` (`quote_id`);
ALTER TABLE `quote_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_images_quote_id_foreign` (`quote_id`);
ALTER TABLE `quote_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_options_quote_id_foreign` (`quote_id`),
  ADD KEY `quote_options_option_id_foreign` (`option_id`);
ALTER TABLE `quote_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quote_staff_staff_id_foreign` (`staff_id`),
  ADD KEY `quote_staff_quote_id_foreign` (`quote_id`);
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_user_id_foreign` (`staff_id`),
  ADD KEY `reviews_service_id_foreign` (`service_id`),
  ADD KEY `reviews_order_id_foreign` (`order_id`);
ALTER TABLE `review_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_images_review_id_foreign` (`review_id`);
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`),
  ADD KEY `services_category_id_foreign` (`category_id`);
ALTER TABLE `service_add_ons`
  ADD KEY `service_add_ons_service_id_foreign` (`service_id`),
  ADD KEY `service_add_ons_add_on_id_foreign` (`add_on_id`);
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_categories_slug_unique` (`slug`),
  ADD KEY `service_categories_parent_id_foreign` (`parent_id`);
ALTER TABLE `service_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_images_service_id_foreign` (`service_id`);
ALTER TABLE `service_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_options_service_id_foreign` (`service_id`);
ALTER TABLE `service_packages`
  ADD KEY `service_packages_service_id_foreign` (`service_id`),
  ADD KEY `service_packages_package_id_foreign` (`package_id`);
ALTER TABLE `service_to_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_to_category_service_id_foreign` (`service_id`),
  ADD KEY `service_to_category_category_id_foreign` (`category_id`);
ALTER TABLE `service_to_user_notes`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `service_variants`
  ADD KEY `service_variants_service_id_foreign` (`service_id`),
  ADD KEY `service_variants_variant_id_foreign` (`variant_id`);
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);
ALTER TABLE `short_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `short_holidays_staff_id_foreign` (`staff_id`);
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_user_id_foreign` (`user_id`),
  ADD KEY `staff_driver_id_foreign` (`driver_id`),
  ADD KEY `staff_affiliate_id_foreign` (`affiliate_id`),
  ADD KEY `staff_membership_plan_id_foreign` (`membership_plan_id`);
ALTER TABLE `staff_drivers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_drivers_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_drivers_driver_id_foreign` (`driver_id`),
  ADD KEY `staff_drivers_time_slot_id_foreign` (`time_slot_id`);
ALTER TABLE `staff_general_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_general_holidays_staff_id_foreign` (`staff_id`);
ALTER TABLE `staff_groups`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `staff_group_driver`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_group_driver_driver_id_foreign` (`driver_id`),
  ADD KEY `staff_group_driver_staff_group_id_foreign` (`staff_group_id`);
ALTER TABLE `staff_group_staff_zone`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_group_staff_zone_staff_group_id_foreign` (`staff_group_id`),
  ADD KEY `staff_group_staff_zone_staff_zone_id_foreign` (`staff_zone_id`);
ALTER TABLE `staff_group_to_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_group_to_staff_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_group_to_staff_staff_group_id_foreign` (`staff_group_id`);
ALTER TABLE `staff_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_holidays_staff_id_foreign` (`staff_id`);
ALTER TABLE `staff_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_images_staff_id_foreign` (`staff_id`);
ALTER TABLE `staff_sub_title`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_sub_title_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_sub_title_sub_title_id_foreign` (`sub_title_id`);
ALTER TABLE `staff_supervisor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_supervisor_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_supervisor_supervisor_id_foreign` (`supervisor_id`);
ALTER TABLE `staff_to_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_to_categories_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_to_categories_category_id_foreign` (`category_id`);
ALTER TABLE `staff_to_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_to_services_staff_id_foreign` (`staff_id`),
  ADD KEY `staff_to_services_service_id_foreign` (`service_id`);
ALTER TABLE `staff_youtube_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_youtube_videos_staff_id_foreign` (`staff_id`);
ALTER TABLE `staff_zones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_zones_currency_id_foreign` (`currency_id`);
ALTER TABLE `sub_titles`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `supervisor_to_managers`
  ADD KEY `supervisor_to_managers_manager_id_foreign` (`manager_id`),
  ADD KEY `supervisor_to_managers_supervisor_id_foreign` (`supervisor_id`);
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_slots_group_id_foreign` (`group_id`);
ALTER TABLE `time_slot_to_staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_slot_to_staff_time_slot_id_foreign` (`time_slot_id`),
  ADD KEY `time_slot_to_staff_staff_id_foreign` (`staff_id`);
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_user_id_foreign` (`user_id`),
  ADD KEY `transactions_order_id_foreign` (`order_id`);
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);
ALTER TABLE `user_affiliate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_affiliate_user_id_foreign` (`user_id`),
  ADD KEY `user_affiliate_affiliate_id_foreign` (`affiliate_id`);
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_documents_user_id_foreign` (`user_id`);
ALTER TABLE `withdraws`
  ADD PRIMARY KEY (`id`),
  ADD KEY `withdraws_user_id_foreign` (`user_id`);


ALTER TABLE `affiliates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `affiliate_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `affiliate_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `bids`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `bid_chats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `bid_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `campaigns`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_collections`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `chats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `complaints`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `complaint_chats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `coupons`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `coupon_histories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `coupon_to_category`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `coupon_to_service`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `crms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `currencies`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `customer_coupons`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `customer_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `drivers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `driver_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `faqs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `information`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `long_holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `membership_plans`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_attachments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_chats`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_comments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_histories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `order_totals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `quotes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `quote_category`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `quote_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `quote_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `quote_staff`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `reviews`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `review_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `service_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `service_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `service_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `service_to_category`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `service_to_user_notes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `short_holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_drivers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_general_holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_group_driver`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_group_staff_zone`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_group_to_staff`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_holidays`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_images`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_sub_title`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_supervisor`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_to_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_to_services`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_youtube_videos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `staff_zones`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `sub_titles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `time_slots`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `time_slot_to_staff`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_affiliate`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_documents`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `withdraws`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `affiliates`
  ADD CONSTRAINT `affiliates_membership_plan_id_foreign` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `affiliates_parent_affiliate_id_foreign` FOREIGN KEY (`parent_affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `affiliates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `affiliate_categories`
  ADD CONSTRAINT `affiliate_categories_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `affiliate_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE;
ALTER TABLE `affiliate_services`
  ADD CONSTRAINT `affiliate_services_affiliate_category_id_foreign` FOREIGN KEY (`affiliate_category_id`) REFERENCES `affiliate_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `affiliate_services_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `bids`
  ADD CONSTRAINT `bids_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bids_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `bid_chats`
  ADD CONSTRAINT `bid_chats_bid_id_foreign` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bid_chats_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `bid_images`
  ADD CONSTRAINT `bid_images_bid_id_foreign` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE CASCADE;
ALTER TABLE `cash_collections`
  ADD CONSTRAINT `cash_collections_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cash_collections_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chats_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaints_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `complaint_chats`
  ADD CONSTRAINT `complaint_chats_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaint_chats_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `coupon_histories`
  ADD CONSTRAINT `coupon_histories_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_histories_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
ALTER TABLE `coupon_to_category`
  ADD CONSTRAINT `coupon_to_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_to_category_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE;
ALTER TABLE `coupon_to_service`
  ADD CONSTRAINT `coupon_to_service_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_to_service_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `customer_coupons`
  ADD CONSTRAINT `customer_coupons_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_coupons_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `customer_profiles`
  ADD CONSTRAINT `customer_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `drivers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `driver_orders`
  ADD CONSTRAINT `driver_orders_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `driver_orders_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
ALTER TABLE `faqs`
  ADD CONSTRAINT `faqs_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faqs_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `long_holidays`
  ADD CONSTRAINT `long_holidays_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_service_staff_id_foreign` FOREIGN KEY (`service_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_time_slot_id_foreign` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE SET NULL;
ALTER TABLE `order_attachments`
  ADD CONSTRAINT `order_attachments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
ALTER TABLE `order_chats`
  ADD CONSTRAINT `order_chats_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_chats_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `order_comments`
  ADD CONSTRAINT `order_comments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `order_histories`
  ADD CONSTRAINT `order_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
ALTER TABLE `order_services`
  ADD CONSTRAINT `order_services_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_services_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;
ALTER TABLE `order_totals`
  ADD CONSTRAINT `order_totals_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotes_bid_id_foreign` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotes_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
ALTER TABLE `quote_category`
  ADD CONSTRAINT `quote_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quote_category_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;
ALTER TABLE `quote_images`
  ADD CONSTRAINT `quote_images_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;
ALTER TABLE `quote_options`
  ADD CONSTRAINT `quote_options_option_id_foreign` FOREIGN KEY (`option_id`) REFERENCES `service_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quote_options_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;
ALTER TABLE `quote_staff`
  ADD CONSTRAINT `quote_staff_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quote_staff_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `review_images`
  ADD CONSTRAINT `review_images_review_id_foreign` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE;
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
ALTER TABLE `services`
  ADD CONSTRAINT `services_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL;
ALTER TABLE `service_add_ons`
  ADD CONSTRAINT `service_add_ons_add_on_id_foreign` FOREIGN KEY (`add_on_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_add_ons_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_categories`
  ADD CONSTRAINT `service_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_images`
  ADD CONSTRAINT `service_images_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_options`
  ADD CONSTRAINT `service_options_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_packages`
  ADD CONSTRAINT `service_packages_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_packages_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_to_category`
  ADD CONSTRAINT `service_to_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_to_category_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `service_variants`
  ADD CONSTRAINT `service_variants_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_variants_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
ALTER TABLE `short_holidays`
  ADD CONSTRAINT `short_holidays_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `staff_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `staff_membership_plan_id_foreign` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `staff_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_drivers`
  ADD CONSTRAINT `staff_drivers_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_drivers_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_drivers_time_slot_id_foreign` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_general_holidays`
  ADD CONSTRAINT `staff_general_holidays_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_group_driver`
  ADD CONSTRAINT `staff_group_driver_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_group_driver_staff_group_id_foreign` FOREIGN KEY (`staff_group_id`) REFERENCES `staff_groups` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_group_staff_zone`
  ADD CONSTRAINT `staff_group_staff_zone_staff_group_id_foreign` FOREIGN KEY (`staff_group_id`) REFERENCES `staff_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_group_staff_zone_staff_zone_id_foreign` FOREIGN KEY (`staff_zone_id`) REFERENCES `staff_zones` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_group_to_staff`
  ADD CONSTRAINT `staff_group_to_staff_staff_group_id_foreign` FOREIGN KEY (`staff_group_id`) REFERENCES `staff_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_group_to_staff_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_holidays`
  ADD CONSTRAINT `staff_holidays_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_images`
  ADD CONSTRAINT `staff_images_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_sub_title`
  ADD CONSTRAINT `staff_sub_title_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_sub_title_sub_title_id_foreign` FOREIGN KEY (`sub_title_id`) REFERENCES `sub_titles` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_supervisor`
  ADD CONSTRAINT `staff_supervisor_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_supervisor_supervisor_id_foreign` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_to_categories`
  ADD CONSTRAINT `staff_to_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_to_categories_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_to_services`
  ADD CONSTRAINT `staff_to_services_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_to_services_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_youtube_videos`
  ADD CONSTRAINT `staff_youtube_videos_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `staff_zones`
  ADD CONSTRAINT `staff_zones_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL;
ALTER TABLE `supervisor_to_managers`
  ADD CONSTRAINT `supervisor_to_managers_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supervisor_to_managers_supervisor_id_foreign` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `time_slots`
  ADD CONSTRAINT `time_slots_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `staff_groups` (`id`) ON DELETE CASCADE;
ALTER TABLE `time_slot_to_staff`
  ADD CONSTRAINT `time_slot_to_staff_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_slot_to_staff_time_slot_id_foreign` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE CASCADE;
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `user_affiliate`
  ADD CONSTRAINT `user_affiliate_affiliate_id_foreign` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_affiliate_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
ALTER TABLE `withdraws`
  ADD CONSTRAINT `withdraws_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;
