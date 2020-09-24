const Discord = require('discord.js');
require('dotenv').config()

const client = new Discord.Client();
const { APP_TOKEN, APP_PREFIX, BOT_ID } = process.env;

client.once('ready', () => {
    console.log('[ONLINE]');
});

client.on('message', message => {
    if (!message.content.startsWith(APP_PREFIX) || message.author.bot) return;

    try {
        const args = message.content.slice(APP_PREFIX.length).split(/ +/);
        const command = args.shift().toLowerCase();
    
        if (command === 'mute-start' && message.member.hasPermission('ADMINISTRATOR')) {
            if (message.member.voice.channel) {
               
                const embed = new Discord.MessageEmbed()
                    .setTitle('Have a fun session!')
                    .setDescription('Click the 🔊 reaction to toggle your voice channel between mute/unmute!')
                    .setFooter('Now be quiet!')
                    .setColor(15158332)
                    .attachFiles(['./src/assets/shhhhhhh.jpg'])
                    .setImage('attachment://shhhhhhh.jpg');
    
                message.channel
                    .send({ embed: embed })
                    .then(sentEmbed => {
                        sentEmbed.react('🔊');
                    });
            } else {
                message.channel.send(`Hey ${message.author}, you need to join a voice channel first!`);
            }
        }
    } catch (e) {
        console.error('[Error] -', e.message);
    }
});

client.on('messageReactionAdd', (reaction, user) => { handleReaction(reaction, user, true); });
client.on('messageReactionRemove', (reaction, user) => { handleReaction(reaction, user, false); });

function handleReaction(reaction, user, mute) {
    const { message } = reaction;

    if (user.id === BOT_ID || message.author.id !== BOT_ID) return;

    const currentUser = message.guild.members.cache.get(user.id);
    
    if (currentUser.hasPermission('ADMINISTRATOR')) {
        if (currentUser.voice.channel) {
            const emoji = reaction.emoji.name;
            const channelId = currentUser.voice.channel.id;
            
            if (emoji === '🔊') {
                handleToggleMute(message, channelId, mute);
            }
        } else {
            message.channel.send(`Hey ${currentUser}, you need to join a voice channel first!`);
        }
    }
}

function handleToggleMute(message, channelId, mute) {
    const channel = message.guild.channels.cache.get(channelId);

    for (const [memberID, member] of channel.members) {
        member.voice.setMute(mute);
    }
}

client.login(APP_TOKEN);
