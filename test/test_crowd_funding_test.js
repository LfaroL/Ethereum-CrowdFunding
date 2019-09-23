let CrowdFunding = artifacts.require('./TestCrowdFunding');

// Specify the test name and get accounts in the network were testing on through function(accounts)
contract('CrowdFunding', function(accounts) {

	// contract variable for each test
	let contract;
	// specify first account in the Ganache test network to be contractCreator
	let contractCreator = accounts[0];
	// specify second account in the test network to be the beneficiary
	let beneficiary = accounts[1];

	const ONE_ETH_NUMBER = 1000000000000000000
	const ONE_ETH = web3.utils.toBN(ONE_ETH_NUMBER); // convert to Big Number because that's the type of numbers used in an Ethereum network
	const ERROR_MSG = "Returned error: VM Exception while processing transaction: revert";
	// convert int to Big Number because that's the type that enum uses for each state
	const ONGOING_STATE = web3.utils.toBN(0);
	const FAILED_STATE = web3.utils.toBN(1);
	const SUCCEEDED_STATE = web3.utils.toBN(2);
	const PAID_OUT_STATE = web3.utils.toBN(3);

	// before each test, setup the crowdfunding smart contract
	beforeEach(async function() {
		contract = await CrowdFunding.new(
			'funding',
			1,
			10,
			beneficiary,
			{
				from: contractCreator,
				gas: 2000000
			}
		);
	});

	// test to ensure each field is properly initialized
	it('contract is initialized', async function() {
		// contract.variable.call() to get the variable
		let campaignName = await contract.name.call();
		expect(campaignName).to.equal('funding');

		// to.deep.equal() for Big Numbers
		let targetAmount = await contract.targetAmount.call();
		expect(targetAmount).to.deep.equal(ONE_ETH);

		// toNumber() to convert Big Number
		let fundingDeadline = await contract.fundingDeadline.call();
		expect(fundingDeadline.toNumber()).to.equal(600);

		let actualBeneficiary = await contract.beneficiary.call();
		expect(actualBeneficiary).to.equal(beneficiary);

		let state = await contract.state.call();
		expect(state.valueOf()).to.deep.equal(ONGOING_STATE);
	});

	// test to ensure totalCollected is increased when contribute method is called
	it('funds are contributed', async function () {
		// when calling a method that requires a value of ether
		// place the value and source address as a parameter in JSON format
		// value: etherAmountInBN | from: addressOfSender
		await contract.contribute({value: ONE_ETH,from: contractCreator});

		// amounts is a mapping. put the parameter in call function. amounts[address]
		let contributed = await contract.amounts.call(contractCreator);
		expect(contributed).to.deep.equal(ONE_ETH);

		let totalCollected = await contract.totalCollected.call();
		expect(totalCollected).to.deep.equal(ONE_ETH);
	});

	it('cannot contribute after deadline', async function() {
		try {
			await contract.setCurrentTime(601);
			await contract.sendTransaction({
				value: ONE_ETH_NUMBER,
				from: contractCreator
			});
			// when expecting a test to fail, use this method so that 
			// when it fails with the specified error, the test will pass
			expect.fail();
		} catch (error) {
			expect(error.message).to.equal(ERROR_MSG);
		}
	});

	it('crowdfunding succeeded', async function() {
		await contract.contribute({value: ONE_ETH_NUMBER, from: contractCreator});
		await contract.setCurrentTime(601);
		await contract.finishCrowdFunding();
		let state = await contract.state.call();

		expect(state.valueOf()).to.deep.equal(SUCCEEDED_STATE);
	});

	it('crowdfunding failed', async function() {
		await contract.setCurrentTime(601);
		await contract.finishCrowdFunding();
		let state = await contract.state.call();

		expect(state.valueOf()).to.deep.equal(FAILED_STATE);
	});

    it('collected money paid out', async function() {
        await contract.contribute({value: ONE_ETH_NUMBER, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        // use web3 to get balance based on address
        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect();

        let newBalance = await web3.eth.getBalance(beneficiary);
        let difference = newBalance - initAmount;
        // getBalance returns a number, not BN
        expect(difference).to.equal(ONE_ETH_NUMBER);

        let fundingState = await contract.state.call()
        expect(fundingState.valueOf()).to.deep.equal(PAID_OUT_STATE);
    });

    it('withdraw funds from the contract', async function() {
        await contract.contribute({value: ONE_ETH_NUMBER - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        await contract.withdraw();
        let amount = await contract.amounts.call(contractCreator);
        expect(amount).to.deep.equal(web3.utils.toBN(0));
    });

    it('event is emmitted', async function() {
    	// let watcher = await contract.CampaignFinished();
    	await contract.setCurrentTime(601);
    	await contract.finishCrowdFunding();

    	// get past events from the specified event
    	let events = await contract.getPastEvents(contract.CampaignFinished());
    	// this is the emitted event based on the finishCrowdFunding() method
    	let event = events[0];
    	expect(event.args.totalCollected.toNumber()).to.equal(0);
    	expect(event.args.succeeded).to.equal(false);
    });
});