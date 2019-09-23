# Ethereum-CrowdFunding
Ethereum Smart Contract using Solidity and JS <br />
Uses Truffle Framework and Ganache for local deployment and testing <br /><br />

<b>CrowdFunding contract</b><br/>
<ul>
  <li>Creates a crowdfunding campaign with specified name, target amount, deadline, and beneficiary</li>
  <ul><li>Ex: contract = CrowdFunding.new('test funding', 1, 10, beneficiary, {from: 0x0, gas: 2000000})</li></ul>
  <li>contribute(): donate to the crowdfunding with specified ether value</li>
  <li>withdraw(): withdraw the contributed amount back to donor</li>
  <li>finishCrowdFunding(): when deadline has passed, end the campaign and emit an event with the result</li>
  </ul>
  
<br />
<b>To test</b> (while on root directory and Ganache running): <br />
1. truffle migrate --network ganache <br />
2. truffle test --network ganache <br />

<br /><br />
<b>Learning Ethereum</b>: <br />
1. MetaMask to create my first Ethereum account in the Rinkeby network<br />
<img src="/images/MetaMask.png" alt="MetaMask" width=auto height=300>

2. Rinkeby Faucet for some practice Ethereum <br />
<img src="/images/Rinkeby_Faucet.png" alt="Faucet" height=300 width=auto>

3. Remix to create Hello World using Solidity<br />
<img src="/images/HelloWorld.png" alt="HelloWorld" height=300 widht=auto>

4. Deployed a few practice smart contracts using Remix<br />
<img src="/images/SuccessfulDeployment.png" alt="Deployment" height=300 width=auto>

5. Geth to interact with the Ethereum Rinkeby network using web3.js <br />
<img src="/images/geth.png" alt="Geth" height=300 width=auto>
<img src="/images/geth_interaction.png" alt="Geth Interaction" height=300 width=auto>

6. Truffle Framework with Ganache to deploy and test the crowdfunding contract <br />
<img src="/images/Ganache.png" alt="Ganache" height=300 width=auto>
<img src="/images/testing.png" alt="Test" height=300 width=auto>
