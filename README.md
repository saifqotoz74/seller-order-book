# دفتر طلبات البائع (Seller Order Book)

Small sellers on Facebook, Instagram and WhatsApp take orders in chat and track them in a notebook or in the chat itself. That is where lost orders, double shipping and "who paid?" confusion come from.

- Paste the customer's message. The app pulls out the name, Egyptian mobile number (01x, with or without +20, Arabic or English digits), address, items and price. You check the fields and save.
- Payment type: cash on delivery or already paid (InstaPay / Vodafone Cash).
- Status per order: new, shipped, delivered, returned.
- Totals: cash currently with the courier (COD orders marked shipped), confirmed sales, returns.
- One-tap WhatsApp message to the customer with the order status.
- Arabic RTL, works offline, no signup. Data stays in the browser (`localStorage`).

Pure HTML, CSS and JavaScript. Open `index.html`.

Limits: the message parser is rule-based, so it handles common formats and you always review the fields. No sync across devices. A demo/portfolio project.
