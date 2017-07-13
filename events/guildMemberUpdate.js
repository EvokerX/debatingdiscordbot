exports.run = (client, oldMember, newMember) => {
	console.log('Event fired: guildMemberUpdate.');
	console.log('---User updated: ' + newMember.user.id);
	console.log('---Guild changed in: ' + newMember.guild.id);
	
	// Inform us if a user's display name changed or their roles changed.
	if (oldMember.displayName != newMember.displayName || oldMember.roles.array.toString() != newMember.roles.array.toString()) {
			var guildConf2 = client.guildConfs.get(oldMember.guild.id);
			let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
			
			if (historychannel)
			{
			historychannel.send('', {embed: {
				title: 'A user has changed in the guild',
				color: 8453888,
				author: {
					name: newMember.user.username + newMember.user.discriminator + ' (' + newMember.user.id + ')',
					icon_url: newMember.user.avatarURL
				},
				description: 'The above member has changed their details.',
				fields: [{
					name: 'Display Name',
					value: oldMember.displayName + ' => ' + newMember.displayName,
				},
				{
					name: 'Roles',
					value: 'TO BE IMPLEMENTED', // I cannot seem to find a working function for this
				}
				],
				}});
				console.log('---Message sent to the logs channel.');
			}
		}
};
