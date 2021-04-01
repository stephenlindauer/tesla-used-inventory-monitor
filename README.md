# Tesla Used Inventory Monitor
Hits an internal Tesla api to search for existing used inventory and prints to console every time there are new vehicles or price changes for your search parameters


## Setup & Run instructions
```
git clone git@github.com:stephenlindauer/tesla-used-inventory-monitor.git
cd tesla-used-inventory-monitor
npm install
node search.js
```


## Results
Regularly hits the api per the defined `POLLING_INTERVAL_MIN` (use responsibly, don't spam) and retuns new vehicles and price changes.

**Shows when new vehicles are found:**
```
Found new vehicle: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 $80.6k
	 22.5k miles
	 Vehicle History: CLEAN
	 Inventory Reason: LEASE_MATURITY
	 has HW3 installed? no

Found new vehicle: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 $81.2k
	 50.0k miles
	 Vehicle History: CLEAN
	 Inventory Reason: TRADEIN
	 has HW3 installed? yes
```

**Price updates:**
```
Price change: 2017 100D Ludicrous Performance All-Wheel Drive
	 https://www.tesla.com/used/<redacted>
	 Was: $78.6k
	 Now: $78.8k
```
