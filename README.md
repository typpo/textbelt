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

### License (MIT)

TextBelt
Copyright (C) 2012 by Ian Webster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
