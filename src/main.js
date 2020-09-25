const Discord = require('discord.js');
require('dotenv').config()

class Bot {
    client = new Discord.Client();
    emojis = { '🔈': true, '🔊': false };
    
    constructor() {
        this.events();
        this.login();
    }

    events() {
        this.client.once('ready', () => {
            console.log('[ONLINE]');
        });
        
        this.client.on('message', message => {
            if (!message.content.startsWith(process.env.APP_PREFIX) || message.author.bot) return;
        
            try {
                const args = message.content.slice(process.env.APP_PREFIX.length).split(/ +/);
                const command = args.shift().toLowerCase();
            
                if (command === 'mute-start') {
                    this.checkUserPermissions(message, message.member, (message) => {
                        const embed = new Discord.MessageEmbed()
                                .setTitle('Have a fun session!')
                                .setDescription('To mute everyone click the 🔈 icon bellow!\nTo unmute everyone click the 🔊 icon bellow!')
                                .setFooter('Now be quiet!')
                                .setColor(15158332)
                                .attachFiles(['./src/assets/shhhhhhh.jpg'])
                                .setImage('attachment://shhhhhhh.jpg');
                
                        message.channel
                            .send({ embed: embed })
                            .then(async sentEmbed => {
                                await sentEmbed.react('🔈');
                                await sentEmbed.react('🔊');
                            });
                    });
                }
            } catch (e) {
                console.error('[Error] -', e.message);
            }
        });
        
        this.client.on('messageReactionAdd', (reaction, user) => { 
            if (user.id === process.env.BOT_ID || reaction.message.author.id !== process.env.BOT_ID) return;
            
            try {
                const { message } = reaction;
                const member = message.guild.members.cache.get(user.id);
                const mute = this.emojis[reaction.emoji.name];
                
                if (mute !== undefined) {
                    this.checkUserPermissions(message, member, (message, user) => {
                        const channel = message.guild.channels.cache.get(user.voice.channel.id);
                        
                        this.removeCurrentReaction(message, user);
                        this.handleToggleMute(channel, mute);
                    });
                }
            } catch (e) {
                console.error('[Error] -', e.message);
            }
        }); 
    };

    login() {
        this.client.login(process.env.APP_TOKEN);
    }

    checkUserPermissions(message, member, callback) {
        if (member.hasPermission('ADMINISTRATOR')) {
            if (member.voice.channel) {
                return callback(message, member);
            } else {
                this.removeCurrentReaction(message, member);
                message.channel.send(`Hey ${member}, you need to join a voice channel first!`);
            }
        }
    }

    removeCurrentReaction (message, user) {
        const reactions = message.reactions.cache;
        
        const muteReaction = reactions.find(reaction => reaction.emoji.name === '🔈');
        const unMuteReaction = reactions.find(reaction => reaction.emoji.name === '🔊');
        
        if (muteReaction)
            muteReaction.users.remove(user);
        
        if (unMuteReaction)
            unMuteReaction.users.remove(user);
    }

    handleToggleMute(channel, mute) {
        for (const [memberID, member] of channel.members) {
            member.voice.setMute(mute);
        }
    }
}

new Bot();