# Ethereum-CrowdFunding
Ethereum Smart Contract using Solidity and JS <br />
Uses Truffle Framework and Ganache for local deployment and testing <br /><br />

CrowdFunding contract<br/>
<ul>
  <li>Creates a crowdfunding campaign with specified name, target amount, deadline, and beneficiary</li>
  <ul><li>Ex: contract = CrowdFunding.new('test funding', 1, 10, beneficiary, {from: 0x0, gas: 2000000})</li></ul>
  <li>contribute(): donate to the crowdfunding with specified ether value</li>
  <li>withdraw(): withdraw the contributed amount back to donor</li>
  <li>finishCrowdFunding(): when deadline has passed, end the campaign and emit an event with the result</li>
  </ul>
  
<br />
To test (on root directory): <br />
1. truffle migrate --network ganache <br />
2. truffle test --network ganache <br />

