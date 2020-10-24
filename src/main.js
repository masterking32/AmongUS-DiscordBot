const Discord = require('discord.js');
require('dotenv').config()

class Bot {
    client = new Discord.Client();
    prefix1 = `${process.env.COMMAND}`;
    prefix2 = `<@!${process.env.BOT_ID}> `;
    
    constructor() {
        this.events();
        this.login();
    }

    events() {
        this.client.once('ready', () => {
            console.log('[ONLINE]');
        });

        this.client.on('message', message => {
            if (message.author.bot) return;
			
			
			const args = this.checkCommand(message);
			if(!args)
			{
				return;
			}
			
			const command = args.shift().toLowerCase();
            try {
  
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
                            .attachFiles(['./assets/shhhhhhh.png'])
                            .setImage('attachment://shhhhhhh.png');
                
                        message.channel
                            .send({ embed: embed })
                            .then(async sentEmbed => {
                                await sentEmbed.react('🔈');
                                await sentEmbed.react('🔊');
                            });
                    });
                } else if (command === 'info' || command === 'help') {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('AmongUS-MasterkinG32! Info!')
                        .setDescription('How to use:')
                        .addFields(
                            { name: 'How to call it', value: `${process.env.COMMAND}start`, inline: true },
                            { name: 'Help command', value: `${process.env.COMMAND}help`, inline: true },
                            { name: 'Send game code', value: `${process.env.COMMAND}code PrivateCode`, inline: true },
                            { name: 'Requirements', value: 'Admin user, must be connected to a voice channel', inline: false },
                            { name: 'Output', value: 'The bot will send a message and start listening to actions, those actions being clicking in the mute and unmute buttons.', inline: false },
                        )
                        .setFooter('Happy usage!')
                        .setColor(15158332)
                        .attachFiles(['./assets/info.png'])
                        .setImage('attachment://info.png');
                
                    message.channel
                        .send({ embed: embed });
                } else if (command === 'code') {
					const member = message.guild.members.cache.get(message.author.id);
					this.checkUserPermissions(message, member, (message, member) => {
                        const channel = message.guild.channels.cache.get(member.voice.channel.id);
						this.handleSendPrivateCode(message, channel, args);
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
			try{
				member.voice.setMute(mute);
			} catch (e) {
                console.error('[Error] -', e.message);
            }
        }
    }
	
    handleSendPrivateCode(message, channel, code) {
		const embed = new Discord.MessageEmbed()
			.setTitle('AmongUS-MasterkinG32! Invite!')
			.setDescription('You\'re invited to the game')
			.addFields(
				{ name: 'Invited by: ', value: '<@' + message.author.id + '>', inline: false },
				{ name: 'Private code: ', value: '`' + code + '`', inline: false },
			)
			.setFooter('Happy usage!')
			.setColor(15158332)
			.attachFiles(['./assets/game.png'])
			.setImage('attachment://game.png');
	
        for (const [memberID, member] of channel.members) {
			try{
                const user = message.guild.members.cache.get(memberID);
				user.send({ embed: embed });
			} catch (e) {
                console.error('[Error] -', e.message);
            }
        }
    }
	
	checkCommand(message)
	{
		if(message.content.startsWith(this.prefix1))
		{
			return message.content.slice(this.prefix1.length).split(/ +/);
		}else if(message.content.startsWith(this.prefix2))
		{
			return message.content.slice(this.prefix2.length).split(/ +/);
		} else {
			return false;
		}
	}
}

new Bot();