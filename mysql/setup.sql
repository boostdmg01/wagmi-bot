SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `config` (
  `name` varchar(80) NOT NULL,
  `value` text NOT NULL,
  `type` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `config` (`name`, `value`, `type`) VALUES
('content_channel_ids', '', 'string[]'),
('content_elevation_channel_id', '', 'string'),
('creator_emoji_id', '', 'string'),
('creator_role_id', '', 'string'),
('director_role_id', '', 'string'),
('elevation_emoji_id', '', 'string'),
('elevation_required_emojis', '', 'integer'),
('finder_emoji_id', '', 'string'),
('finder_role_id', '', 'string'),
('instant_elevation_channel_id', '', 'string'),
('introduction_channel_id', '', 'string'),
('lurker_emoji_id', '', 'string'),
('lurker_role_id', '', 'string'),
('newcomer_role_id', '', 'string'),
('news_channel_ids', '', 'string[]'),
('news_elevation_channel_id', '', 'string'),
('unverified_role_id', '', 'string'),
('verification_channel_id', '', 'string'),
('verification_dm_text', '', 'string'),
('verification_dm_success_text', '', 'string'),
('verification_intro_text', '', 'string'),
('log_channel_id', '', 'string');

CREATE TABLE `elevation` (
  `oldMessageId` varchar(20) NOT NULL,
  `oldChannelId` varchar(20) NOT NULL,
  `newMessageId` varchar(20) NOT NULL,
  `newChannelId` varchar(20) NOT NULL,
  `userId` varchar(20) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timestamp` int(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `emoji` (
  `id` bigint(20) NOT NULL,
  `treasuryId` bigint(20) NOT NULL,
  `emojiId` varchar(20) NOT NULL,
  `amount` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `treasury` (
  `id` bigint(12) NOT NULL,
  `name` varchar(80) NOT NULL,
  `coinName` varchar(255) DEFAULT NULL,
  `elevationActive` tinyint(1) NOT NULL DEFAULT 0,
  `elevationChannelId` varchar(20) DEFAULT NULL,
  `elevationEmojiId` varchar(20) DEFAULT NULL,
  `elevationAmount` int(3) NOT NULL DEFAULT 0,
  `type` varchar(20) DEFAULT NULL,
  `rpcUrl` varchar(255) DEFAULT NULL,
  `chainPrefix` int(4) DEFAULT NULL,
  `mnemonic` text DEFAULT NULL,
  `privateKey` text DEFAULT NULL,
  `isNative` tinyint(1) DEFAULT NULL,
  `tokenAddress` varchar(255) DEFAULT NULL,
  `tokenDecimals` int(2) DEFAULT 18,
  `chainOptions` text DEFAULT NULL,
  `royaltyAddress` varchar(255) DEFAULT NULL,
  `royaltyEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `royaltyPercentage` double DEFAULT NULL,
  `assetId` bigint(20) DEFAULT NULL,
  `sendMinBalance` tinyint(1) NOT NULL DEFAULT 1,
  `sendExistentialDeposit` tinyint(1) NOT NULL DEFAULT 0,
  `parachainType` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `id` varchar(20) NOT NULL,
  `evmAddress` varchar(255) DEFAULT NULL,
  `substrateAddress` varchar(255) DEFAULT NULL,
  `twitterHandle` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `valuation` (
  `id` bigint(20) NOT NULL,
  `messageId` varchar(20) NOT NULL,
  `discordEmojiId` varchar(20) NOT NULL,
  `treasuryId` bigint(20) NOT NULL,
  `userId` varchar(20) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timestamp` int(12) NOT NULL,
  `value` double NOT NULL,
  `messageLink` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `transactionHash` varchar(255) DEFAULT NULL,
  `transactionTimestamp` int(12) DEFAULT NULL,
  `royaltyTransactionHash` varchar(255) DEFAULT NULL,
  `royaltyTransactionTimestamp` int(12) DEFAULT NULL,
  `royaltyValue` double DEFAULT NULL,
  `royaltyStatus` tinyint(1) NOT NULL DEFAULT 1,
  `source` varchar(255) NOT NULL,
  `minBalanceBumped` tinyint(1) NOT NULL DEFAULT 0,
  `sentExistentialDeposit` tinyint(1) NOT NULL DEFAULT 0,
  `royaltyMinBalanceBumped` tinyint(1) NOT NULL DEFAULT 0,
  `royaltySentExistentialDeposit` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `existential_deposit` (
  `userId` varchar(20) NOT NULL,
  `chainPrefix` int(4) NOT NULL,
  `transactionHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `existential_deposit`
  ADD UNIQUE KEY `userId` (`userId`,`chainPrefix`);

ALTER TABLE `config`
  ADD PRIMARY KEY (`name`);

ALTER TABLE `emoji`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `treasury`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `valuation`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `emoji`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `treasury`
  MODIFY `id` bigint(12) NOT NULL AUTO_INCREMENT;

ALTER TABLE `valuation`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
