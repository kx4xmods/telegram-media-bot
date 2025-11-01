const { Telegraf } = require('telegraf');
const axios = require('axios');

// Bot Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || '8596403610:AAEF6yMHt7-cbRqMGrrq5wYzwuebHoIl95Y';
const BOT_LINK = 'https://t.me/Securiitysafetyrobot';
const OWNER_ID = parseInt(process.env.OWNER_ID) || 8350395359;
const OWNER_USERNAME = '@Securiitysafetyrobot';

const bot = new Telegraf(BOT_TOKEN);

// Simple database
const db = {
    channels: [],
    broadcasts: []
};

// Admin check function
function isOwner(ctx) {
    return ctx.from && ctx.from.id === OWNER_ID;
}

// Start command
bot.command('start', async (ctx) => {
    const isOwnerUser = isOwner(ctx);
    
    await ctx.reply(
        `👋 Welcome to ADVANCE RANDOM MEDIA BOT!\n📸 Instantly fetch random images & videos!\n\n📌 How It Works?\n➊ Add this bot to your channel ✅\n➋ It will automatically replace messages with fresh content 🚀\n➌ Enjoy endless random media effortlessly 😃\n\n${isOwnerUser ? '👑 You are the Owner of this Bot 👑' : ''}`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '➕ Add to Your Channel', url: BOT_LINK }],
                    [{ text: '👑 Contact Owner', url: `https://t.me/${OWNER_USERNAME.replace('@', '')}` }],
                    [{ text: '📊 Bot Status', callback_data: 'status' }]
                ]
            }
        }
    );
});

// Get channels where bot is admin
bot.command('channels', async (ctx) => {
    if (!isOwner(ctx)) {
        return ctx.reply('❌ This command is only for the bot owner.');
    }
    await ctx.reply('📋 Channels Management\n\nAdd bot to channels and it will auto-replace messages with random media!');
});

// Broadcast command
bot.command('broadcast', async (ctx) => {
    if (!isOwner(ctx)) return ctx.reply('❌ Owner only command.');
    
    const message = ctx.message.text.replace('/broadcast', '').trim();
    if (!message) return ctx.reply('❌ Usage: /broadcast Your message');
    
    ctx.reply(`📢 Broadcast: ${message}`);
});

// Random query generator
function getRandomQuery() {
    const queries = ['nature', 'technology', 'art', 'music', 'sports', 'space'];
    return queries[Math.floor(Math.random() * queries.length)];
}

// Fetch random media
async function fetchRandomMedia() {
    try {
        const query = getRandomQuery();
        const mediaType = Math.random() < 0.5 ? 'photo' : 'video';
        const endpoint = mediaType === 'video' ? 'https://pixabay.com/api/videos' : 'https://pixabay.com/api/';

        const response = await axios.get(endpoint, {
            params: {
                key: '49283332-fd0f9dceca851e251176e53c7',
                q: query,
                per_page: 10,
                safesearch: true
            }
        });

        const media = response.data.hits;
        if (!media.length) return null;

        const mediaItem = media[Math.floor(Math.random() * media.length)];
        
        return mediaType === 'video' ? {
            type: 'video',
            url: mediaItem.videos.medium.url,
            caption: `🎥 Random Video | Query: ${query}`
        } : {
            type: 'photo', 
            url: mediaItem.webformatURL,
            caption: `📸 Random Photo | Query: ${query}`
        };
    } catch (error) {
        console.error('Media fetch failed:', error.message);
        return null;
    }
}

// Handle channel posts
bot.on('channel_post', async (ctx) => {
    try {
        const chatId = ctx.channelPost.chat.id;
        const messageId = ctx.channelPost.message_id;

        // Store channel info
        if (!db.channels.some(ch => ch.id === chatId)) {
            const chat = await ctx.getChat();
            db.channels.push({
                id: chat.id,
                title: chat.title,
                username: chat.username,
                type: chat.type,
                addedAt: new Date().toISOString()
            });
        }

        // Delete original message
        await ctx.deleteMessage(messageId).catch(err => {
            console.log('Message delete failed:', err.message);
        });

        // Fetch and send random media
        const randomMedia = await fetchRandomMedia();
        if (!randomMedia) return;

        if (randomMedia.type === 'video') {
            await ctx.telegram.sendVideo(chatId, randomMedia.url, {
                caption: randomMedia.caption,
                parse_mode: 'HTML'
            });
        } else {
            await ctx.telegram.sendPhoto(chatId, randomMedia.url, {
                caption: randomMedia.caption, 
                parse_mode: 'HTML'
            });
        }

    } catch (error) {
        console.error('Channel post error:', error.message);
    }
});

// Callback queries
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    
    if (callbackData === 'status') {
        await ctx.reply(`🤖 Bot Status\n\n✅ Bot is online!\n👑 Owner: ${OWNER_USERNAME}`);
    }
});

// Start bot
bot.launch().then(() => {
    console.log('🤖 Bot Started Successfully!');
}).catch(err => {
    console.error('❌ Bot failed to start:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
