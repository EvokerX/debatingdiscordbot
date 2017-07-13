exports.run = (client, guild, user) => {
	console.log('Event fired: guildBanAdd.');
	console.log('---User banned: ' + user.id);
	console.log('---Guild banned in: ' + guild.id);
	
	// Let us know in the history channel that someone applied a Discord ban on a user
	    var guildConf2 = client.guildConfs.get(guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    
	    if (historychannel)
	    {
		historychannel.sendMessage('', {embed: {
			title: 'User Discord-banned from guild!',
			color: 16711680,
			author: {
				name: user.username + user.discriminator + ' (' + user.id + ')',
				icon_url: user.avatarURL
			},
			description: 'A user has been Discord-banned from this guild.',
			}});
			console.log('---Message sent to the logs channel.');
		}
};
