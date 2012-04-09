### TextBelt
TextBelt (http://textbelt.com) is a texting API that uses carrier-specific gateways to deliver your text messages for free.  This is nice for a low-cost texting app or testing without running down your Twilio balance.

Usage is dead simple:

```
$ curl http://textbelt.com/text \
   -d number=5551234567 \
   -d "message=I sent this message for free with textbelt.com"
```

### Success and Failure
Sample success:

```
{"success":true}
```

Sample failure:

```
{"success":false,"message":"Exceeded quota for this phone number."}
```

### Notes and Limitations

 *  IP addresses are limited to 75 texts per day.  Phone numbers are limited to 3 texts every 3 minutes.  If you need increased limits, please contact admin@textbelt.com.

 *  Some carriers may deliver text messages from "txt@textbelt.com"

 *  We support the following U.S. providers: Alltel, Ameritech, AT&T Wireless, Boost, CellularOne, Cingular, Edge Wireless, Sprint PCS, Telus Mobility, T-Mobile, Metro PCS, Nextel, O2, Orange, Qwest, Rogers Wireless, US Cellular, Verizon, Virgin Mobile.
