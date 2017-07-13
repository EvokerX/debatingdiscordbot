exports.run = (event) => {
console.log('[error] LOST CONNECTION! Terminating bot with the hopes pm2 will reboot it and reestablish a connection.');
process.exit(1); // Terminate the bot when it loses connection with Discord. That way, pm2 can reboot it.
};
