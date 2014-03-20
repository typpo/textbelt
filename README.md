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

### Canadian and International endpoints

For Canadian texts, curl `http://textbelt.com/canada`.

For international texts, curl `http://textbelt.com/intl`.

Canadian and international support may not be complete.  Refer to the list of supported carriers.

### Notes and Limitations

 *  IP addresses are limited to 75 texts per day.  Phone numbers are limited to 3 texts every 3 minutes.  If you need increased limits, please contact admin@textbelt.com.

 *  Some carriers may deliver text messages from "txt@textbelt.com"

 *  Supported U.S. carriers: Alltel, Ameritech, AT&T Wireless, Boost, CellularOne, Cingular, Edge Wireless, Sprint PCS, Telus Mobility, T-Mobile, Metro PCS, Nextel, O2, Orange, Qwest, Rogers Wireless, US Cellular, Verizon, Virgin Mobile.

 *  Supported U.S. and Canadian carriers (/canada):  3 River Wireless, ACS Wireless, AT&T, Alltel, BPL Mobile, Bell Canada, Bell Mobility, Bell Mobility (Canada), Blue Sky Frog, Bluegrass Cellular, Boost Mobile, Carolina West Wireless, Cellular One, Cellular South, Centennial Wireless, CenturyTel, Cingular (Now AT&T), Clearnet, Comcast, Corr Wireless Communications, Dobson, Edge Wireless, Fido, Golden Telecom, Helio, Houston Cellular, Idea Cellular, Illinois Valley Cellular, Inland Cellular Telephone, MCI, MTS, Metro PCS, Metrocall, Metrocall 2-way, Microcell, Midwest Wireless, Mobilcomm, Nextel, OnlineBeep, PCS One, President's Choice, Public Service Cellular, Qwest, Rogers AT&T Wireless, Rogers Canada, Satellink, Solo Mobile, Southwestern Bell, Sprint, Sumcom, Surewest Communicaitons, T-Mobile, Telus, Tracfone, Triton, US Cellular, US West, Unicel, Verizon, Virgin Mobile, Virgin Mobile Canada, West Central Wireless, Western Wireless

 *  Supported international carriers (/intl):  Chennai RPG Cellular, Chennai Skycell / Airtel, Comviq, DT T-Mobile, Delhi Aritel, Delhi Hutch, Dutchtone / Orange-NL, EMT, Escotel, German T-Mobile, Goa BPLMobil, Golden Telecom, Gujarat Celforce, JSM Tele-Page, Kerala Escotel, Kolkata Airtel, Kyivstar, LMT, Lauttamus Communication, Maharashtra BPL Mobile, Maharashtra Idea Cellular, Manitoba Telecom Systems, Meteor, MiWorld, Mobileone, Mobilfone, Mobility Bermuda, Mobistar Belgium, Mobitel Tanzania, Mobtel Srbija, Movistar, Mumbai BPL Mobile, Netcom, Ntelos, O2, O2 (M-mail), One Connect Austria, OnlineBeep, Optus Mobile, Orange, Orange Mumbai, Orange NL / Dutchtone, Oskar, P&T Luxembourg, Personal Communication, Pondicherry BPL Mobile, Primtel, SCS-900, SFR France, Safaricom, Satelindo GSM, Simple Freedom, Smart Telecom, Southern LINC, Sunrise Mobile, Surewest Communications, Swisscom, T-Mobile Austria, T-Mobile Germany, T-Mobile UK, TIM, TSR Wireless, Tamil Nadu BPL Mobile, Tele2 Latvia, Telefonica Movistar, Telenor, Teletouch, Telia Denmark, UMC, Uraltel, Uttar Pradesh Escotel, Vessotel, Vodafone Italy, Vodafone Japan, Vodafone UK, Wyndtell

### License (MIT)

TextBelt
Copyright (C) 2012 by Ian Webster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
