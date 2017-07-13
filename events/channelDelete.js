exports.run = (client, channel) => {
	console.log('Event fired: Channel delete.');
	console.log('---Channel deleted: ' + channel.id);
	
	// Tell us that a channel was deleted in the configured history channel
	var guildConf2 = client.guildConfs.get(channel.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    
	    if (historychannel)
	    {
		historychannel.send('', {embed: {
			title: 'Channel Deleted!',
			color: 16711680,
			description: 'The channel ' + channel.id + ' was deleted.',
			}});
			console.log('---Message sent to the logs channel.');
		}
};
