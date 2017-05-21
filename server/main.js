import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  /**
   * Created by yiseulcho on 5/3/17.
   */
  const BrusselsRestConnectionUrl = "http://localhost:20001"
  const request = require('request');
  const Drone = require('parrot-minidrone');
  const Logger = require('winston');
  const drone = new Drone({
    autoconnect: true,
  });

// connected & take off

  drone.on('connected', () => {
    drone.takeOff();
  });

// 1) Log the 1st battery level data
// 2) Flip until the battery level drops x%
// 3) Warning about critical battery level
// 4) landing
// 5) Corda payment

  var flipped=false;

  function consume_battery(){
    drone.on('flightStatusChange', (status) => {
      Logger.info(`Flying status-index.js: ${status}`);
      if (status === 'hovering') {
        var bl = drone.getBatteryLevel();
        Logger.info(`Battery Level-index.js: ${bl}%`);
      }
      if(!flipped){
        drone.animate("flipBack");
        flipped=true;
      }
    });
  }

  function collect_alert(){
    drone.on('AlertStateChanged', (state) => {
      Logger.info(`Alert state-index.js: ${state}`);
    });
  }

  function land(){
    Logger.info("Now in Land() function.")
    drone.land();
  }

  function Corda_payment() {
    // success1 = true;
    // success2 = true;

    var options = {
      url: BrusselsRestConnectionUrl + "/api/sn/tx",
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        "amount": "2017051400000000000",
        "exchangeRate": "0,90525592",
        "sellCurrency": "USD",
        "buyCurrency": "GBP",
        "sellOffice": "NEW_YORK",
        "buyOffice": "LONDON"
      },
      json: true
    };

    Logger.info("Now in Cordapayment() function.");

    request.post(options, function (error, response, body) {
      Logger.info(response.statusCode)
      if(!error && (response.statusCode >= 200) && (response.statusCode < 300)) {
        Logger.info(body);
      }
    });
  };

  // var http = require('http')
  // var body = JSON.stringify({
  //   amount: "20170514000000",
  //   exchangeRate: "0,90525592",
  //   sellCurrency: "USD",
  //   buyCurrency: "GBP",
  //   sellOffice: "LONDON",
  //   buyOffice: "NEW_YORK"
  // })
  //
  // var request = new http.ClientRequest({
  //   hostname: "localhost",
  //   port: 20001,
  //   path: "/api/sn/tx",
  //   method: "POST",
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  //
  // request.end(body);



  setTimeout(consume_battery, 3000);
//  setTimeout(collect_alert,3000);
  setTimeout(land, 15000);

// Add condition to trigger payment : when it's low battery or critical level of battery -> make a payment
// Corda_payment();
// setTimeout(Corda_payment, 15000);

});
