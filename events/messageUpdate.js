exports.run = (client, oldMessage, newMessage) => {
if (newMessage.channel.id == '287073556834025472') return null; // Do not inform us of edited messages from the mods and gods channel
		console.log('Event fired: messageUpdate.');
	console.log('---message changed: ' + newMessage.id);
	
	// If the content of a message has changed, inform us in the history channel.
	if (oldMessage.guild != null && newMessage.guild != null && oldMessage.content != newMessage.content)
	{
		console.log('---Guild changed in: ' + newMessage.guild.id);
		console.log('---Channel changed in: ' + newMessage.channel.id);
		var guildConf2 = client.guildConfs.get(newMessage.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    client.funcs.antispam(client, newMessage, 'update');
	    
	    if (historychannel)
	    {
		historychannel.send('', {embed: {
			title: 'A message was updated',
			color: 33023,
			author: {
				name: oldMessage.author.username + oldMessage.author.discriminator + ' (' + oldMessage.author.id + ')',
				icon_url: oldMessage.author.avatarURL
			},
			description: 'The above member has edited a message.',
			fields: [{
				name: 'Old Message',
				value: oldMessage.content,
			},
			{
				name: 'New Message',
				value: newMessage.content,
			},
			{
				name: 'Channel Edited From',
				value: oldMessage.channel.name,
			}
			],
			}});
			console.log('---Message sent to the logs channel.');
		}
	}
};
