cat > bot.js << 'EOF'
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Bot Configuration
const BOT_TOKEN = '8596403610:AAEF6yMHt7-cbRqMGrrq5wYzwuebHoIl95Y';
const BOT_LINK = 'https://t.me/Securiitysafetyrobot';
const OWNER_ID = 8350395359;
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
        `👋 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐀𝐃𝐕𝐀𝐍𝐂𝐄 𝐑𝐀𝐍𝐃𝐎𝐌 𝐌𝐄𝐃𝐈𝐀 𝐁𝐎𝐓!  
📸 𝑰𝒏𝒔𝒕𝒂𝒏𝒕𝒍𝒚 𝒇𝒆𝒕𝒄𝒉 𝒓𝒂𝒏𝒅𝒐𝒎 𝒊𝒎𝒂𝒈𝒆𝒔 & 𝒗𝒊𝒅𝒆𝒐𝒔!  

📌 𝗛𝗼𝘄 𝗜𝘁 𝗪𝗼𝗿𝗸𝘀?  
➊ 𝗔𝗱𝗱 𝘁𝗵𝗶𝘀 𝗯𝗼𝘁 𝘁𝗼 𝘆𝗼𝘂𝗿 𝗰𝗵𝗮𝗻𝗻𝗲𝗹 ✅  
➋ 𝗜𝘁 𝘄𝗶𝗹𝗹 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰𝗮𝗹𝗹𝘆 𝗿𝗲𝗽𝗹𝗮𝗰𝗲 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝘄𝗶𝘁𝗵 𝗳𝗿𝗲𝘀𝗵 𝗰𝗼𝗻𝘁𝗲𝗻𝘁 🚀  
➌ 𝗘𝗻𝗷𝗼𝘆 𝗲𝗻𝗱𝗹𝗲𝘀𝘀 𝗿𝗮𝗻𝗱𝗼𝗺 𝗺𝗲𝗱𝗶𝗮 𝗲𝗳𝗳𝗼𝗿𝘁𝗹𝗲𝘀𝘀𝗹𝘆 😃

${isOwnerUser ? '👑 **You are the Owner of this Bot** 👑' : ''}`,
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

    try {
        await ctx.reply(`📋 **Channels Management**

🤖 Bot is currently configured to work in any channel where it's added as admin.

🔧 **To manage channels manually:**
1. Add bot to channel as Admin
2. Give Delete Messages permission
3. Bot will auto-replace messages with random media

💡 **For member management, use these commands in your channel:**
• To remove member: /ban @username
• To kick member: /kick @username  
• To mute member: /mute @username

📢 **To broadcast in specific channel:**
Use /broadcast command with channel ID`);
        
    } catch (error) {
        console.error('Error fetching channels:', error);
        ctx.reply('❌ Error fetching channel list.');
    }
});

// Enhanced broadcast command
bot.command('broadcast', async (ctx) => {
    if (!isOwner(ctx)) {
        return ctx.reply('❌ This command is only for the bot owner.');
    }
    
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length < 2) {
        return ctx.reply(`📢 **Broadcast Usage:**

1. **Broadcast to all channels:**
   \`/broadcast all Your message here\`

2. **Broadcast to specific channel:**
   \`/broadcast CHANNEL_ID Your message here\`

🔄 **Example:**
\`/broadcast all Hello everyone! This is a test broadcast.\``);
    }
    
    const target = args[0];
    const message = args.slice(1).join(' ');
    
    try {
        if (target === 'all') {
            let successCount = 0;
            let failCount = 0;
            
            for (const channel of db.channels) {
                try {
                    await ctx.telegram.sendMessage(channel.id, `📢 **Broadcast:**\n\n${message}`);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send to ${channel.title}:`, error);
                    failCount++;
                }
            }
            
            await ctx.reply(`✅ Broadcast completed!\n✅ Successful: ${successCount}\n❌ Failed: ${failCount}`);
        } else {
            const channelId = target.startsWith('@') ? target : target.startsWith('-100') ? target : `-100${target}`;
            
            try {
                await ctx.telegram.sendMessage(channelId, `📢 **Broadcast:**\n\n${message}`);
                await ctx.reply(`✅ Broadcast sent to channel ${channelId}`);
            } catch (error) {
                await ctx.reply(`❌ Failed to send broadcast to ${channelId}. Error: ${error.message}`);
            }
        }
    } catch (error) {
        console.error('Broadcast error:', error);
        ctx.reply('❌ Broadcast failed. Check channel IDs and bot permissions.');
    }
});

// Member management commands
bot.command('ban', async (ctx) => {
    if (!ctx.message.reply_to_message) {
        return ctx.reply('❌ Usage: Reply to a user message with /ban');
    }
    
    try {
        const userId = ctx.message.reply_to_message.from.id;
        const username = ctx.message.reply_to_message.from.username;
        
        await ctx.banChatMember(userId);
        await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
        
        await ctx.reply(`✅ User ${username ? '@' + username : 'ID: ' + userId} has been banned.`);
        
    } catch (error) {
        console.error('Ban error:', error);
        await ctx.reply('❌ Failed to ban user. Make sure I have admin permissions.');
    }
});

bot.command('kick', async (ctx) => {
    if (!ctx.message.reply_to_message) {
        return ctx.reply('❌ Usage: Reply to a user message with /kick');
    }
    
    try {
        const userId = ctx.message.reply_to_message.from.id;
        const username = ctx.message.reply_to_message.from.username;
        
        await ctx.banChatMember(userId);
        await ctx.unbanChatMember(userId);
        await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
        
        await ctx.reply(`✅ User @${username} has been kicked.`);
        
    } catch (error) {
        console.error('Kick error:', error);
        await ctx.reply('❌ Failed to kick user. Make sure I have admin permissions.');
    }
});

// Random query generator
function getRandomQuery() {
    const queries = [
        'nature', 'technology', 'abstract', 'art', 'cinema', 'vintage', 'animals', 'fantasy',
        'sports', 'space', 'ocean', 'mountains', 'gaming', 'music', 'dance', 'robots',
        'cars', 'luxury', 'cities', 'travel', 'love', 'fitness', 'wildlife', 'adventure'
    ];
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
                per_page: 100,
                safesearch: true
            }
        });

        const media = response.data.hits;
        if (!media || !media.length) {
            console.log('🔴 No media found for query:', query);
            return null;
        }

        const mediaItem = media[Math.floor(Math.random() * media.length)];
        
        if (mediaType === 'video') {
            return {
                type: 'video',
                url: mediaItem.videos.medium.url,
                caption: `🎥 Random Video | Query: ${query}\n\n🤖 Bot: ${BOT_LINK}\n👑 Owner: ${OWNER_USERNAME}`
            };
        } else {
            return {
                type: 'photo',
                url: mediaItem.webformatURL,
                caption: `📸 Random Photo | Query: ${query}\n\n🤖 Bot: ${BOT_LINK}\n👑 Owner: ${OWNER_USERNAME}`
            };
        }
    } catch (error) {
        console.error('🔴 Media fetch failed:', error.message);
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
            console.log('⚠️ Message delete failed:', err.message);
        });

        // Fetch and send random media
        const randomMedia = await fetchRandomMedia();
        if (!randomMedia) return;

        let sentMessage;
        if (randomMedia.type === 'video') {
            sentMessage = await ctx.telegram.sendVideo(chatId, randomMedia.url, {
                caption: randomMedia.caption,
                parse_mode: 'HTML'
            });
        } else {
            sentMessage = await ctx.telegram.sendPhoto(chatId, randomMedia.url, {
                caption: randomMedia.caption,
                parse_mode: 'HTML'
            });
        }

        // Auto-delete after 5 minutes
        setTimeout(async () => {
            try {
                await ctx.deleteMessage(sentMessage.message_id);
            } catch (error) {
                console.log('⚠️ Auto-delete failed:', error.message);
            }
        }, 5 * 60 * 1000);

    } catch (error) {
        console.error('❌ Channel post error:', error.message);
    }
});

// Callback queries
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    
    if (callbackData === 'status') {
        await ctx.reply(`🤖 **Bot Status**\n\n✅ Bot is online!\n👑 Owner: ${OWNER_USERNAME}\n📊 Channels: ${db.channels.length}`);
    }
});

// Start bot
bot.launch().then(() => {
    console.log('🤖 Bot Started Successfully!');
}).catch(err => {
    console.error('❌ Bot failed to start:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
EOF