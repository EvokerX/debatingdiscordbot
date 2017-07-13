exports.run = (client, member) => {
	console.log('Event fired: guildMemberRemove.');
	console.log('---User left: ' + member.user.id);
	console.log('---Guild left from: ' + member.guild.id);
	
	// Let us know in the hostory channel that a member left.
	    var guildConf2 = client.guildConfs.get(member.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	    
	    if (historychannel)
	    {
		historychannel.send('', {embed: {
			title: 'A user has left the guild',
			color: 32768,
			author: {
				name: member.user.username + member.user.discriminator + ' (' + member.user.id + ')',
				icon_url: member.user.avatarURL
			},
			description: 'The above member has just left the guild.',
			}});
			console.log('---Message sent to the logs channel.');
		}
};
