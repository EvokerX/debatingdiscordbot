exports.run = (client, message) => {
  if (message.channel.id == '287073556834025472') return null; // Do not inform us of messages deleted from the mods and gods channel
	console.log('Event fired: messageDelete.');
	console.log('---message deleted: ' + message.id);
	console.log('---Guild deleted from: ' + message.guild.id);
	console.log('---Channel deleted from: ' + message.channel.id);
	
	// Inform us in history channel when a message was deleted.
		var guildConf2 = client.guildConfs.get(message.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    
	    if (historychannel)
	    {
		historychannel.send('', {embed: {
			title: 'A message was deleted',
			color: 255,
			author: {
				name: message.author.username + message.author.discriminator + ' (' + message.author.id + ')',
				icon_url: message.author.avatarURL
			},
			description: 'The above member has deleted a message.',
			fields: [{
				name: 'Message Deleted',
				value: message.content,
			},
			{
				name: 'Channel Deleted From',
				value: message.channel.name,
			}
			],
			}});
			console.log('---Message sent to the logs channel.');
		}
};
