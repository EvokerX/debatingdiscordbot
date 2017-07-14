var isprofanity = require('isprofanity');
var stringSimilarity = require('string-similarity');
var path = require('path');

module.exports = (client, msg, method) => {
		if (msg.author.bot || !msg.guild || !msg.member || msg.channel.id == '315390130305368066') return; // No antispam if the message has no author, guild, or came from the jail channel.
		if (method == 'score') // Triggered via a command; show us our spam score
		{
			antispam_heuristics_step2(client, msg, 'score', 0, 1);
			return;
		}
			antispam_mute_step1_1(client, msg, method);
};


// Step 1 mute 1: Remove messages if the user in this guild is under a jail. Should not ever need to be done, but is a safeguard in case of evasion.
function antispam_mute_step1_1(client, msg, method)
{
			var deleteit = 0;
			client.funcs.database.query('SELECT * FROM cron WHERE (((`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) <= `timestamp`) AND task LIKE ?) OR task LIKE ?) AND parameter LIKE ?', ['unjail', 'jail', msg.author.id],
			function (err, result, fields) {
								if (err) throw err;
								else {
									if (result.length > 0)
									{
										console.log('A message was sent by a jailed user. User: ' + msg.author.id + '. Guild: ' + msg.guild.id);
										msg.delete();
										console.log('---Message deleted. Message: ' + msg.id);
										antispam_heuristics_step2(client, msg, method, -1);
									} else {
									antispam_mute_step2(client, msg, method);
									}
								}
			});
}

// Step 2 mute: Remove messages if the channel is under a mute.
function antispam_mute_step2(client, msg, method)
{
			var deleteit = 0;
			client.funcs.database.query('SELECT * FROM cron WHERE (`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) <= `timestamp`) AND task LIKE ? AND parameter LIKE ?', ['unmutechannel', msg.channel.id],
			function (err, result, fields) {
								if (err) throw err;
								else {
									if (result.length > 0)
									{
										console.log('A message was sent in a muted channel. Channel: ' + msg.channel.id + '. Guild: ' + msg.guild.id);
										msg.delete();
										console.log('---Message deleted. Message: ' + msg.id);
										antispam_heuristics_step2(client, msg, method, -1);
									} else {
                    antispam_heuristics_step2(client, msg, method, 0);
									}
								}
			});
}

// Step 2 heuristics: Check the spam scores of messages within the last 5 minutes.
// Also check for duplicate messages. If this message is a duplicate, we're going to increase its spam score.
function antispam_heuristics_step2(client, msg, method, deleteit, returnit = 0)
{
		// get the messages from the same user in the same guild within the last 5 minutes, not including the message we're scoring
		client.funcs.database.query('SELECT *, (CAST(UNIX_TIMESTAMP() AS UNSIGNED) - `timestamp`) AS timeelapsed FROM chatlogs WHERE guildID LIKE ? AND userID LIKE ? AND timestamp > (CAST(UNIX_TIMESTAMP() AS UNSIGNED) - (60 * 5)) AND messageID NOT LIKE ?', [msg.guild.id, msg.author.id, msg.id],
				function (err, result, fields) {
					if (err) throw err;
					else {
						var totalscore = 0;
						var duplicateMult = 1;
						for (var i in result) {
							// BROKEN: Change decay to 1 minute instead of default 5 minutes if message was from a configured one minute decay channel.
							try
							{
							var oneMinute = (msg.guildConf.oneMinuteDecayChannels).includes('<#' + msg.channel.id + '>');
							}catch(e) {
							var oneMinute = false;
							}
							if (result[i].timeelapsed < 60) // Messages newer than 1 minute = full score
							{
								totalscore += result[i].spamscore;
							} else if (result[i].timeelapsed < 120 && !oneMinute) // Messages 1-2 minutes old = 1/2 score.
							{
								totalscore += (result[i].spamscore / 2);
							} else if (result[i].timeelapsed < 240 && !oneMinute) // Messages 2-4 minutes old = 1/4 score.
							{
								totalscore += (result[i].spamscore / 4);
							} else if (!oneMinute) { // Messages 4-5 minutes old = 1/8 score.
								totalscore += (result[i].spamscore / 8);
							}
							
							// For every message that is 90% or similar to this one, increase the score multiplier for this message by 1 (BROKEN: unless from a configured duplicates allowed channel)
							try
							{
							if ((stringSimilarity.compareTwoStrings(result[i].message, msg.content) > 0.9) && !(msg.guildConf.duplicatesAllowedChannels).includes('<#' + msg.channel.id + '>'))
							{
								duplicateMult += 1;
							}
							}catch(e){
							if ((stringSimilarity.compareTwoStrings(result[i].message, msg.content) > 0.9))
							{
								duplicateMult += 1;
							}
							}
						}
						// If we just want a user's spam score, terminate here with a message. Otherwise, continue with antispam.
						if (returnit == 0) antispam_heuristics_step3(client, msg, method, deleteit, totalscore, duplicateMult);
						else {
							msg.channel.send('', {embed: {
								title: 'Spam Score',
								color: 16728192,
								description: 'Your spam score is ' + totalscore + '. Antispam jailing is triggered at 100. Scores completely decay after 5 minutes. Your score is influenced by the messages you send in the guild. Messages containing links/embeds, attachments, mentions, long content, or are similar to other messages you sent within the last 5 minutes will influence your score more.',
							}});
							msg.channel.stopTyping();
							console.log('---Message sent to the user in the channel the command was executed in.');
						}
					}
				});
}

// Step 3 heuristics: Calculate a spam score for this message.
function antispam_heuristics_step3(client, msg, method, deleteit, totalscore, duplicateMult)
{
	console.log('Antispam for message ' + msg.id);
var score = 5; // base score for each message sent.

// Add score depending on message length
var thecont = msg.content;
if (thecont.length > 256) // bigger than 8 bits?
	score += 5;
if (thecont.length > 1999) // As high as Discord will allow (if you used exactly 2000 characters, which is the discord max, chances are you're spamming)!
	score += 10;
	
// Add score for mentions
var nummentions = msg.mentions.users.size + msg.mentions.roles.size;
if (nummentions > 0)
	score += 5;
if (nummentions > 2)
	score += 5;
if (nummentions > 5)
	score += 10;
if (nummentions > 9)
	score += 10;

// Add score for embeds
var numembeds = msg.embeds.length;
score += (10 * numembeds);

// Add score for attachments
var numattachments = msg.attachments.size;
score += (10 * numattachments);

// Add bonus score for profanity
var profanity = 0;
var newstring = msg.content;
var editmessage = false;
isprofanity(msg.content,function(t,blocked){
for (index = 0; index < blocked.length; ++index) {
	
    if (blocked[index].sureness >= 0.5) // if a word matches profanity 50% or more
    {
		score += 1;
		profanity += 1;
	}
	if (blocked[index].sureness >= 0.75) // If a word matches profanity 75% or more
	{
		score += 2;
		profanity += 2;
	}
	if (blocked[index].sureness > 0.99) // If a word matches profanity virtually 100%
	{
		score += 3;
		profanity += 3;
	}
	
	// If profanityfilter is enabled, have the bot delete the message and replace with a filtered one.
	if (msg.guildConf.profanityFilter && blocked[index].sureness >= msg.guildConf.profanitySureness)
	{
		var exp = new RegExp(blocked[index].word.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "gi");
		console.log('---Profanity filter: Using regex ' + exp);
		newstring = newstring.replace(exp, "[redacted]");
		editmessage = true;
	}
}

if (editmessage)
{
	console.log('---Profanity filter: Deleting message and sending filtered one.');
	msg.reply('...Mkay you need to watch your language. I filtered it for you: ' + newstring);
	deleteit = 4;
}

// Increase/multiply spam score based on duplicates.
score *= duplicateMult;

// Disable antispam for certain guilds and channels based on configuration. Also, configured mods and admins bypass antispam.
try
{
if (!msg.guildConf.antispamGuild || (msg.guildConf.antispamIgnoreChannels).includes('<#' + msg.channel.id + '>') || msg.member.permLevel > 0)
	score = 0;
}catch(e){
}

// Spam scores in shitpost channel and vc and bots channel only get 1/2 of the total score
if (msg.channel.id == '287058763230216203' || msg.channel.id == '325260475573075969')
  score = score / 2;

console.log('---Score calculated: ' + score);
antispam_heuristics_step4(client, msg, method, deleteit, totalscore, score);
});
}

// Step 4 heuristics: Insert or update the message in the logs.
function antispam_heuristics_step4(client, msg, method, deleteit, totalscore, score)
{
switch (method) {
	case 'update':
			client.funcs.database.query('UPDATE chatlogs SET message = ?, timestamp = CAST(UNIX_TIMESTAMP() AS UNSIGNED), spamscore = ? WHERE messageID = ?', [msg.content, score, msg.id],
				function (err, result, fields) {
					if (err) throw err;
					else {
						console.log('---Spam score updated in the database.');
						antispam_heuristics_step5(client, msg, method, deleteit, totalscore, score);
					}
				});
	break;
	default:
			client.funcs.database.query('INSERT INTO chatlogs (messageID, guildID, channelID, userID, message, timestamp, spamscore) VALUES (?, ?, ?, ?, ?, CAST(UNIX_TIMESTAMP() AS UNSIGNED), ?)', [msg.id, msg.guild.id, msg.channel.id, msg.author.id, msg.content, score],
				function (err, result, fields) {
					if (err) throw err;
					else {
						console.log('---Message with spam score added to the database.');
						antispam_heuristics_step5(client, msg, method, deleteit, totalscore, score);
					}
				});
	break;
}
}


// Step 6 heuristics: if the message was marked for deletion, delete it now. Also, issue high spam score triggers if necessary.
function antispam_heuristics_step5(client, msg, method, deleteit, totalscore, score)
{
	if (deleteit > 0) msg.delete();
	if ((totalscore + score) >= 100 && totalscore > 80) // JAIL TIME!
	{
		antispam_trigger_step2(client, msg, score);
	} else if ((totalscore + score) >= 80 && totalscore < 80) { // Warn the user of a high spam score
		msg.channel.send('<@!' + msg.author.id + '> **Your spam score is high (' + (totalscore + score) + '), mkay!**', {embed: {title: 'High spam score!', color: 16776960, description: 'Spammers are bad, mkay. No one likes a spammer. You might want to cool down for 3-5 minutes or I will have to jail you, mkay?', image: {url: 'https://www.lovinity.org/uploads/filedump/discord/highspamscore.png'}}});
		console.log('---HIGH SPAM SCORE! Message sent in the channel for user ' + msg.author.id);
	}
}

// Step 2 trigger: Jail the user if they break a score of 100
function antispam_trigger_step2(client, msg, score)
{
							console.log('---ANTISPAM JAIL TRIGGERED for user ' + msg.author.id);
										// Post messages in history and discipline channels
										let historychannel = client.channels.get(msg.guildConf.historyChannel.replace(/[^\/\d]/g,''));
										let disciplinechannel = client.channels.get(msg.guildConf.disciplineChannel.replace(/[^\/\d]/g,''));
										msg.member.setRoles(['313101366996369408']); //Offender role
										if (disciplinechannel)
										{
										disciplinechannel.send('<@!' + msg.author.id + '> You have been antispam jailed, mkay!', {embed: {
											title: 'Time for some detention!',
											color: 16728192,
											description: 'Now I told you that spammers are bad, mkay? Now you are going to serve some detention. So think about your actions and how they affect others, mkay.',
										}});
										console.log('---Message sent to the user in the discipline channel.');
										}
										
										if (historychannel)
										{
										historychannel.send('', {embed: {
											title: 'User Antispam-jailed',
											color: 16728192,
											author: {
												name: msg.author.username + msg.author.discriminator + ' (' + msg.author.id + ')',
												icon_url: msg.author.avatarURL
											},
											description: 'The above member was jailed due to triggering the antispam.',
										}});
										console.log('---Message sent to the logs channel.');
										}
}
