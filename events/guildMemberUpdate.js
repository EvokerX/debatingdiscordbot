exports.run = (client, oldMember, newMember) => {
	console.log('Event fired: guildMemberUpdate.');
	console.log('---User updated: ' + newMember.user.id);
	console.log('---Guild changed in: ' + newMember.guild.id);
	var guildConf2 = client.guildConfs.get(oldMember.guild.id);
	let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
	
		// First, was the detected change the addition of the Offenders role? If so, note that in the bot for evasion purposes.
		if (!oldMember.roles.has('313101366996369408') && newMember.roles.has('313101366996369408'))
		{
				client.funcs.database.query('INSERT INTO cron (task, parameter, timestamp) VALUES (?, ?, (CAST(UNIX_TIMESTAMP() AS UNSIGNED) + ?))', ['unjail', newMember.user.id, null],
								function (err, result, fields) {
									if (err) throw err;
									else {
										if (historychannel)
										{
										historychannel.send('', {embed: {
											title: 'Offender role ADDED to a user',
											color: 16744448,
											author: {
												name: newMember.user.username + newMember.user.discriminator + ' (' + newMember.user.id + ')',
												icon_url: newMember.user.avatarURL
											},
											description: 'The above member was given the Offender role. Bot has activated jail evasion protection for this user',
										}});
										}
									}
								});
		}
		
		// Was the offender role removed? If so, clear the records from the bot to stop jail evasion protection.
		if (oldMember.roles.has('313101366996369408') && !newMember.roles.has('313101366996369408'))
		{
				client.funcs.database.query('DELETE FROM cron WHERE task LIKE ? AND parameter LIKE ?', ['unjail', newMember.user.id],
								function (err, result, fields) {
									if (err) throw err;
									else {
										if (historychannel)
										{
										historychannel.send('', {embed: {
											title: 'Offender role REMOVED to a user',
											color: 16744448,
											author: {
												name: newMember.user.username + newMember.user.discriminator + ' (' + newMember.user.id + ')',
												icon_url: newMember.user.avatarURL
											},
											description: 'The offender role was removed from the above user. Bot has ceased jail evasion protection for this user.',
										}});
										}
									}
								});
		}
	
	// Inform us if a user's display name changed or their roles changed.
	if (oldMember.displayName != newMember.displayName || oldMember.roles.array.toString() != newMember.roles.array.toString()) {
			
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
