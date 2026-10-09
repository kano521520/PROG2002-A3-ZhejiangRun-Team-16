-- MySQL Standard Database Dump for PROG2002 Assessment 2
-- Project: Zhejiang Community Charity Events Platform (Zhejiang Hope Run)

DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Family Fun Run'),
(2, 'Community 10K'),
(3, 'Half Marathon'),
(4, 'Trail & Nature Run'),
(5, 'City Health Walk');

INSERT INTO `events` (`event_id`, `title`, `category_id`, `location`, `date`, `description`, `image_url`, `organizer`) VALUES
(1, 'West Lake 5K Family Charity Run', 1, 'Hangzhou, West Lake Scenic Area', '2026-10-15', 'A scenic 5K charity run along West Lake in Hangzhou, encouraging families and young runners to raise support for local community education.', 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80', 'Hangzhou Sports & Health Foundation'),
(2, 'Ningbo Harbour Community 10K Challenge', 2, 'Ningbo, Beilun Port Park', '2026-10-22', 'An energetic 10K coastal run promoting healthy urban living and supporting maritime community welfare programs across Ningbo.', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80', 'Ningbo Athletic Association'),
(3, 'Shaoxing Ancient Towpath Half Marathon', 3, 'Shaoxing, Yuecheng District', '2026-11-05', 'Run along historical canal stone paths in Shaoxing. Registration proceeds support ancient water town cultural heritage conservation.', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80', 'Shaoxing Heritage Charity Fund'),
(4, 'Moganshan Forest Trail Charity Run', 4, 'Huzhou, Deqing Moganshan', '2026-11-18', 'An invigorating trail run amidst bamboo forests in Huzhou, boosting environmental conservation and rural medical relief.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', 'Zhejiang Outdoor Sports Union'),
(5, 'Jiaxing South Lake Health Walk & Run', 5, 'Jiaxing, South Lake District', '2026-12-01', 'A community health walk and run designed for residents of all ages to promote wellness and raise funds for elderly care services.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80', 'Jiaxing Civic Welfare Council'),
(6, 'Wenzhou Oujiang Riverfront Night Run', 2, 'Wenzhou, Oujiang Park', '2026-12-12', 'A vibrant waterfront night run along the Oujiang River, raising public awareness for urban youth mental health and wellness.', 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=800&q=80', 'Wenzhou Youth Development Charity');