exports.run = (client, member) => {
	console.log('Event fired: guildMemberAdd.');
	console.log('---User joined: ' + member.user.id);
	console.log('---Guild un-banned in: ' + member.guild.id);
	
	// :et us know in the history channel that a new user joined the guild.
	var guildConf2 = client.guildConfs.get(member.guild.id);
	    let historychannel = client.channels.get(guildConf2.historyChannel.data.replace(/[^\/\d]/g,''));
if (historychannel)
										{
										historychannel.send('', {embed: {
											title: 'A user has joined the guild!',
											color: 65280,
											author: {
												name: member.user.username + member.user.discriminator + ' (' + member.user.id + ')',
												icon_url: member.user.avatarURL
											},
											description: 'The above member has just joined the guild.',
											fields: [{
												name: 'UTC Date user joined Discord',
												value: member.user.createdAt.toUTCString(),
											}],
											}});
											console.log('---Message sent to the logs channel.');
										}
// Check to see if there is a bot record of this user being jailed. If so, re-jail them (jail evasion).                                                      
console.log('---Checking if user is jailed and re-jailing if so.');
client.funcs.database.query('SELECT * FROM cron WHERE task LIKE ? AND parameter LIKE ? AND (`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) <= `timestamp`)', ['unjail', member.user.id],
							function (err, result, fields) {
								if (err) throw err;
								else {
                         if (result.length > 0)
                         {
                         console.log('---RE-JAILING user ' + member.user.id);
                         member.setRoles(['313101366996369408']); //Offender role
                         
                         // Let us know someone was re-jailed.
                         if (historychannel)
                         {
                         historychannel.send('', {embed: {
											title: 'User re-jailed!',
											color: 16776960,
											author: {
												name: member.user.username + member.user.discriminator + ' (' + member.user.id + ')',
												icon_url: member.user.avatarURL
											},
											description: 'The above member has just joined the guild, but had an active jail. User was re-jailed.',
											}});
											console.log('---Message sent to the logs channel.');
                      }
                         }
        }
});
							
};
