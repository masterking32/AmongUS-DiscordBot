const Discord = require('discord.js');
require('dotenv').config()

class Bot {
    client = new Discord.Client();
    prefix = `<@!${process.env.BOT_ID}> `;
    
    constructor() {
        this.events();
        this.login();
    }

    events() {
        this.client.once('ready', () => {
            console.log('[ONLINE]');
        });

        this.client.on('message', message => {
            if (!message.content.startsWith(this.prefix) || message.author.bot) return;
        
            try {
                const args = message.content.slice(this.prefix.length).split(/ +/);
                const command = args.shift().toLowerCase();
  
                if (command === 'start') {
                    this.checkUserPermissions(message, message.member, (message) => {
                        const embed = new Discord.MessageEmbed()
                            .setTitle('Have a fun session!')
                            .setDescription('How to use:')
                            .addFields(
                                { name: 'Click', value: '🔈', inline: true },
                                { name: 'Result', value: 'Mute everyone', inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                                { name: 'Click', value: '🔊', inline: true },
                                { name: 'Result', value: 'Unmute everyone', inline: true },
                                { name: '\u200b', value: '\u200b', inline: true },
                            )
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
                } else if (command === 'info') {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('Shhhhhhh! Info!')
                        .setDescription('How to use:')
                        .addFields(
                            { name: 'Command:', value: 'start', inline: true },
                            { name: 'How to call it', value: '@Shhhhhhh start', inline: true },
                            { name: 'Requirements', value: 'Admin user, must be connected to a voice channel', inline: false },
                            { name: 'Output', value: 'The bot will send a message and start listening to actions, those actions being clicking in the mute and unmute buttons.', inline: false },
                        )
                        .setFooter('Happy usage!')
                        .setColor(15158332)
                        .attachFiles(['./src/assets/shhhhhhh.jpg'])
                        .setImage('attachment://shhhhhhh.jpg');
                
                    message.channel
                        .send({ embed: embed });
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
                
                const emojis = { '🔈': true, '🔊': false };
                const mute = emojis[reaction.emoji.name];
                
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
        message.reactions.cache.forEach(reaction => {
            const emoji = reaction.emoji.name;

            if (emoji.match(/🔈|🔊/)) {
                reaction.users.remove(user);
            }
        });
    }

    handleToggleMute(channel, mute) {
        for (const [memberID, member] of channel.members) {
            member.voice.setMute(mute);
        }
    }
}

new Bot();