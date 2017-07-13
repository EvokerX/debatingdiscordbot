exports.run = (client, guild, user) => {
	console.log('Event fired: guildBanRemove.');
	console.log('---User un-banned: ' + user.id);
	console.log('---Guild un-banned in: ' + guild.id);
	
	// let us know in the history channel that a discord ban was lifted
	    var guildConf2 = client.guildConfs.get(channel.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    
	    if (historychannel)
	    {
		historychannel.sendMessage('', {embed: {
			title: 'Discord-ban lifted!',
			color: 16711680,
			author: {
				name: user.username + user.discriminator + ' (' + user.id + ')',
				icon_url: user.avatarURL
			},
			description: 'The guild ban of this user has been lifted.',
			}});
			console.log('---Message sent to the logs channel.');
		}
};
