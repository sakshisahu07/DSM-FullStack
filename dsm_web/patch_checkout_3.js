const fs = require('fs');

const filePath = 'app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace standard input fields with bounded values
content = content.replace(/<input type="text" placeholder="First Name"/g, 
  `<input type="text" placeholder="First Name" value={contactData.firstName} onChange={(e) => setContactData({...contactData, firstName: e.target.value})}`);
content = content.replace(/<input type="text" placeholder="Last Name"/g, 
  `<input type="text" placeholder="Last Name" value={contactData.lastName} onChange={(e) => setContactData({...contactData, lastName: e.target.value})}`);
content = content.replace(/<input type="text" placeholder="Enter Email Address"/g, 
  `<input type="text" placeholder="Enter Email Address" value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})}`);
content = content.replace(/<input type="text" placeholder="Enter Full Address"/g, 
  `<input type="text" placeholder="Enter Full Address" value={contactData.street} onChange={(e) => setContactData({...contactData, street: e.target.value})}`);

// In desktop view (has 'Enter Your Number' placeholder everywhere due to copy paste by original dev)
content = content.replace(/<legend className="px-2 md:text-\[1rem\]  text-\[#333333\]">Phone Number<\/legend>\s*<div className="flex items-center justify-between py-2">\s*<input type="text" placeholder="Enter Your Number"/,
  `<legend className="px-2 md:text-[1rem]  text-[#333333]">Phone Number</legend>
  <div className="flex items-center justify-between py-2">
  <input type="text" placeholder="Enter Your Number" value={contactData.phone} onChange={(e) => setContactData({...contactData, phone: e.target.value})}`);
content = content.replace(/<legend className="px-2 md:text-\[1rem\]  text-\[#333333\]">Address<\/legend>\s*<div className="flex items-center justify-between py-2">\s*<input type="text" placeholder="Enter Your Number"/,
  `<legend className="px-2 md:text-[1rem]  text-[#333333]">Address</legend>
  <div className="flex items-center justify-between py-2">
  <input type="text" placeholder="Enter Your Number" value={contactData.street} onChange={(e) => setContactData({...contactData, street: e.target.value})}`);
content = content.replace(/<legend className="px-2 md:text-\[1rem\]  text-\[#333333\]">Email Address<\/legend>\s*<div className="flex items-center justify-between py-2">\s*<input type="text" placeholder="Enter Your Number"/,
  `<legend className="px-2 md:text-[1rem]  text-[#333333]">Email Address</legend>
  <div className="flex items-center justify-between py-2">
  <input type="text" placeholder="Enter Your Number" value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})}`);

// Fix Mobile view [0,1] map
content = content.replace(/\{\[0, 1\]\.map\(\(idx\) => \(\s*<div\s*key=\{idx\}\s*onClick=\{\(\) => setSelectedAddress\(idx\)\}\s*className="flex items-start gap-4 cursor-pointer"\s*>/g,
  `{addresses && addresses.length > 0 ? addresses.map((addr: any, idx: number) => (
  <div key={idx} onClick={() => setSelectedAddress(idx)} className="flex items-start gap-4 cursor-pointer">`);

// Replace mobile address text
content = content.replace(/2118 Thornridge Cir\. Syracuse, Connecticut 35624/g, `{addr?.street || addresses?.[selectedAddress]?.street || contactData?.street || 'No Address selected'}`);

// Also add props to MobileCheckoutView
content = content.replace(/shippingFee=\{shippingFee\}/g,
  `shippingFee={shippingFee}
   addresses={addresses}
   contactData={contactData}
   setContactData={setContactData}
   saveAddress={saveAddress}
   setSaveAddress={setSaveAddress}`);

// Update MobileCheckoutView interface
content = content.replace(/shippingFee: number;\s*\}/g,
  `shippingFee: number;
    addresses?: any[];
    contactData?: any;
    setContactData?: any;
    saveAddress?: boolean;
    setSaveAddress?: any;
}`);


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done mapping inputs');
