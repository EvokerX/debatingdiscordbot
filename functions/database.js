const mysql = require('mysql');
const querystring = require('querystring');
var Cron = require('node-cron');

//database connection
var stupidStuff = mysql.createPool({
	connectionLimit: 5,
	host: 'localhost',
	user: 'admin_debdis',
	password: 'AH AH AAH!',
	database: 'admin_debdis'
});
console.log('[debug] MySQL pool created. ');
stupidStuff.on('error', function (err) {
	console.log('[error] MySQL error thrown! %d . ', err.code); // 'ER_BAD_DB_ERROR' 
});
stupidStuff.on('connection', function (connection) {
	console.log('[debug] MySQL connection established. ');
});
console.log('[debug] MySQL pool handlers registered. ');

exports.init = (client) => {

// Re-jail anyone who should be jailed, in case they snuck in when the bot was offline.                   
console.log('[debug] BEGIN re-jailing any members that should be jailed.');
client.funcs.database.query('SELECT * FROM cron WHERE task LIKE ? AND (`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) <= `timestamp`)', ['unjail'],
							function (err, result, fields) {
								if (err) throw err;
								else {
                         for (var i in result) {
                         var userobj = client.users.get(result[i].parameter);
                         var guildobj = client.guilds.get('287046000814718976');
                         var guildmember = guildobj.member(userobj);
                         if (guildmember)
                         {
                         console.log('---RE-JAILING user ' + result[i].parameter);
                         guildmember.setRoles(['313101366996369408']); //Offender role
                         }
                         }
        }
});

// Schedule a CRON to run every minute                   
Cron.schedule('* * * * *', function() {
console.log('Beginning cron job...');
var guildobj = client.guilds.get('287046000814718976');
client.funcs.database.query('SELECT * FROM cron WHERE task LIKE ? OR (`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) >= `timestamp`)', ['jail'],
							function (err, result, fields) {
								if (err) throw err;
								else {
                         for (var i in result) {
                         switch(result[i].task)
                         {
                         case 'jail': // CRON task to jail a user
                         console.log('---JAILING user ' + result[i].parameter);
                         var userobj = client.users.get(result[i].parameter);
                         var guildmember = guildobj.member(userobj);
                         if (guildmember)
                         {
                         guildmember.setRoles(['313101366996369408']); // Offender role
                         }
                         if (result[i].timestamp !== null)
                         {
                         client.funcs.database.query('UPDATE cron SET task = ? WHERE ID = ?', ['unjail', result[i].ID],
							          function (err, resultB, fields) {
          								if (err) throw err;
                           });
                          } else {
                          client.funcs.database.query('DELETE FROM cron WHERE ID = ?', [result[i].ID],
							          function (err, resultB, fields) {
          								if (err) throw err;
                           });
                          }
                         break;
                         case 'unjail': // CRON to unjail a user
                         if (result[i].timestamp !== null)
                         {
							 // Double check to make sure there is no other active jails. Otherwise, do not unjail them.
                         client.funcs.database.query('SELECT * FROM cron WHERE ((task LIKE ? OR task LIKE ?) AND (`timestamp` IS NULL OR CAST(UNIX_TIMESTAMP() AS UNSIGNED) < `timestamp`) AND (parameter LIKE ?))', ['jail', 'unjail', result[i].parameter],
							            function (err, resultB, fields) {
								          if (err) throw err;
								          else {
                           if (resultB.length === 0)
                           {
                        client.funcs.database.query('DELETE FROM cron WHERE ID = ?', [result[i].ID],
							          function (err, resultC, fields) {
          								if (err) throw err;
                           });
                         console.log('---UN-JAILING user ' + result[i].parameter);
                         var disciplinechannel = client.channels.get('327975511160651776');
                         var userobj = client.users.get(result[i].parameter);
                         var guildmember = guildobj.member(userobj);
                         if (guildmember)
                         {
                         guildmember.removeRole('313101366996369408'); //Offender role
                         }
                         if (disciplinechannel)
                           disciplinechannel.send('<@' + result[i].parameter + '> Your jail time has expired. Staff will need to re-add any appropriate roles to you as they were lost during the mute.');
                           }
                           }
                           });
                          }
                           break;
                           case 'unmutechannel': //CRON to unmute a channel.
                           console.log('---UN-MUTING channel ' + result[i].parameter);
                           var thechannel = client.channels.get(result[i].parameter);
                           if (thechannel)
                           {
                           thechannel.send('This channel is no longer muted.');
                           }
                           client.funcs.database.query('DELETE FROM cron WHERE ID = ?', [result[i].ID],
							          function (err, resultB, fields) {
          								if (err) throw err;
                           });
                           break;
                           case 'reminder': //CRON to remind someone of something (reminder command)
                           var thechannel = client.channels.get(result[i].parameter);
                           if (thechannel)
                           {
                           console.log('---REMINDER for ' + result[i].parameter2 + ' in channel ' + result[i].parameter);
                           thechannel.send('*Mister Mackey gets on the intercom* ATTENTION <@' + result[i].parameter2 + '>! ' + result[i].parameter3 + ' Mkay?');
                           }
                           client.funcs.database.query('DELETE FROM cron WHERE ID = ?', [result[i].ID],
							          function (err, resultB, fields) {
          								if (err) throw err;
                           });
                           break;
                         }
                         }
        }
});

// Delete chat log records older than 15 minutes automatically for privacy reasons. Antispam does not need them anymore at this point.
console.log('---Clearing messages from database older than 15 minutes...');
client.funcs.database.query('DELETE FROM chatlogs WHERE (CAST(UNIX_TIMESTAMP() AS UNSIGNED) - ?) > `timestamp`', [(60 * 15)],
function (err, result, fields) {
if (err) throw err;
});
});
}

exports.query = (querystr, postmap, callback) => {
	stupidStuff.query(querystr, postmap, callback);
}
