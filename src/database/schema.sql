-- 1. Create GuildConfig Table
CREATE TABLE
    IF NOT EXISTS GuildConfig (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        guildId TEXT UNIQUE NOT NULL,
        prefferedLang TEXT,
        createdAt TIMESTAMP DEFAULT NOW (),
        updatedAt TIMESTAMP DEFAULT NOW ()
    );

-- 2. Create Logs Table (after GuildConfig and Moderation)
CREATE TABLE
    IF NOT EXISTS Logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        guildConfigId UUID REFERENCES GuildConfig (id) ON DELETE CASCADE,
        enabled BOOLEAN NOT NULL,
        channelId TEXT
    );

-- 3. Create Moderation Table
CREATE TABLE
    IF NOT EXISTS Moderation (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        enabled BOOLEAN NOT NULL,
        channelId TEXT,
        logsId UUID UNIQUE REFERENCES Logs (id) ON DELETE CASCADE
    );

-- 4. Create ReactionRole Table (after GuildConfig)
CREATE TABLE
    IF NOT EXISTS ReactionRole (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        guildId TEXT REFERENCES GuildConfig (guildId) ON DELETE CASCADE,
        messageId TEXT NOT NULL,
        channelId TEXT NOT NULL,
        emoji TEXT NOT NULL,
        roleId TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW (),
        updatedAt TIMESTAMP DEFAULT NOW ()
    );