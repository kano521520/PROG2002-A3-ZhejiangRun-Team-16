-- MySQL Standard Database Dump for PROG2002 Assessment 3
-- Project: Zhejiang Community Charity Events Platform (Zhejiang Hope Run)

-- 1. Drop tables in correct order (child table first due to foreign key constraints)
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `categories`;

-- 2. Create Categories table
CREATE TABLE `categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create Events table
CREATE TABLE `events` (
  `event_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category_id` INT,
  `location` VARCHAR(255) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(500),
  `organizer` VARCHAR(255),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create Registrations table (New feature for Assessment 3)
CREATE TABLE `registrations` (
  `registration_id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(100) NOT NULL,
  `contact_number` VARCHAR(20) NOT NULL,
  `tickets_purchased` INT NOT NULL DEFAULT 1,
  `registration_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Insert initial Categories data
INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Family Fun Run'),
(2, 'Community 10K'),
(3, 'Half Marathon'),
(4, 'Trail & Nature Run'),
(5, 'City Health Walk');

-- 6. Insert initial Events data
INSERT INTO `events` (`event_id`, `title`, `category_id`, `location`, `date`, `description`, `image_url`, `organizer`) VALUES
(1, 'West Lake 5K Family Charity Run', 1, 'Hangzhou, West Lake Scenic Area', '2026-10-15', 'A scenic 5K charity run along West Lake in Hangzhou, encouraging families and young runners to raise support for local community education.', 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80', 'Hangzhou Sports & Health Foundation'),
(2, 'Ningbo Harbour Community 10K Challenge', 2, 'Ningbo, Beilun Port Park', '2026-10-22', 'An energetic 10K coastal run promoting healthy urban living and supporting maritime community welfare programs across Ningbo.', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80', 'Ningbo Athletic Association'),
(3, 'Shaoxing Ancient Towpath Half Marathon', 3, 'Shaoxing, Yuecheng District', '2026-11-05', 'Run along historical canal stone paths in Shaoxing. Registration proceeds support ancient water town cultural heritage conservation.', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80', 'Shaoxing Heritage Charity Fund'),
(4, 'Moganshan Forest Trail Charity Run', 4, 'Huzhou, Deqing Moganshan', '2026-11-18', 'An invigorating trail run amidst bamboo forests in Huzhou, boosting environmental conservation and rural medical relief.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', 'Zhejiang Outdoor Sports Union'),
(5, 'Jiaxing South Lake Health Walk & Run', 5, 'Jiaxing, South Lake District', '2026-12-01', 'A community health walk and run designed for residents of all ages to promote wellness and raise funds for elderly care services.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80', 'Jiaxing Civic Welfare Council'),
(6, 'Wenzhou Oujiang Riverfront Night Run', 2, 'Wenzhou, Oujiang Park', '2026-12-12', 'A vibrant waterfront night run along the Oujiang River, raising public awareness for urban youth mental health and wellness.', 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80', 'Wenzhou Youth Development Charity');

-- 7. Insert initial Registrations data (At least 10 records as required)
INSERT INTO `registrations` (`event_id`, `user_name`, `user_email`, `contact_number`, `tickets_purchased`, `registration_date`) VALUES
(1, 'Zhang San', 'zhangsan@example.com', '0412345678', 2, '2026-10-01 10:00:00'),
(1, 'Li Si', 'lisi@example.com', '0423456789', 1, '2026-10-02 11:30:00'),
(1, 'Wang Wu', 'wangwu@example.com', '0434567890', 4, '2026-10-03 14:15:00'),
(2, 'Zhao Liu', 'zhaoliu@example.com', '0445678901', 2, '2026-10-04 09:20:00'),
(2, 'Sun Qi', 'sunqi@example.com', '0456789012', 1, '2026-10-05 16:45:00'),
(2, 'Zhou Ba', 'zhouba@example.com', '0467890123', 3, '2026-10-06 08:50:00'),
(3, 'Wu Jiu', 'wujiu@example.com', '0478901234', 2, '2026-10-07 13:10:00'),
(3, 'Zheng Shi', 'zhengshi@example.com', '0489012345', 5, '2026-10-08 17:00:00'),
(3, 'Alice Smith', 'alice@example.com', '0490123456', 1, '2026-10-09 10:30:00'),
(3, 'Bob Johnson', 'bob@example.com', '0401234567', 2, '2026-10-09 12:00:00');
