exports.conf = {
  enabled: true,
  spamProtection: true,
};

exports.run = (client, msg) => {
	client.funcs.antispam(client, msg, 'add');
};
