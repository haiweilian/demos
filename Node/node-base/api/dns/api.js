import dns from "dns";

dns.lookup("nodejs.org", (err, address) => {
  console.log(address);
});

dns.lookupService("127.0.0.1", 80, (err, hostname) => {
  console.log(hostname);
});
