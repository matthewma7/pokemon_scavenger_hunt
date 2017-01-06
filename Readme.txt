Development setup:
	
	install latest node 6.6.X

	Server:
		navigate to "Server" directory in command line
		execute "npm install"
		make a copy of "./config/config_template.json" and rename the copy to "config.json"
		execute "node index.js"

	Client:
		navigate to "Client" directory in command line
		execute "npm install"
		execute "npm install -g angular-cli"
		execute "ng serve"

	open browser and navigate to http://localhost:4200

Usage:
	http://localhost:4200
		The pokemon scavenger hunt app
	http://localhost:4200/leaderboard
		Leaderboard	
	http://localhost:4200/barcode
		Barcodes
