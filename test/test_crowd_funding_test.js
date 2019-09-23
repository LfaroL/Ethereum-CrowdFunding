let CrowdFunding = artifacts.require('./TestCrowdFunding');

contract('CrowdFunding', function(accounts) {

	let contract;
	let contractCreator = accounts[0];
	let beneficiary = accounts[1];

	const ONE_ETH_NUMBER = 1000000000000000000
	const ONE_ETH = web3.utils.toBN(ONE_ETH_NUMBER);
	const ERROR_MSG = "Returned error: VM Exception while processing transaction: revert";
	const ONGOING_STATE = web3.utils.toBN(0);
	const FAILED_STATE = web3.utils.toBN(1);
	const SUCCEEDED_STATE = web3.utils.toBN(2);
	const PAID_OUT_STATE = web3.utils.toBN(3);

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

	it('contract is initialized', async function() {
		let campaignName = await contract.name.call();
		expect(campaignName).to.equal('funding');

		let targetAmount = await contract.targetAmount.call();
		expect(targetAmount).to.deep.equal(ONE_ETH);

		let fundingDeadline = await contract.fundingDeadline.call();
		expect(fundingDeadline.toNumber()).to.equal(600);

		let actualBeneficiary = await contract.beneficiary.call();
		expect(actualBeneficiary).to.equal(beneficiary);

		let state = await contract.state.call();
		expect(state.valueOf()).to.deep.equal(ONGOING_STATE);
	});

	it('funds are contributed', async function () {
		await contract.contribute({
			value: ONE_ETH,
			from: contractCreator
		});

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

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({from: contractCreator});

        let newBalance = await web3.eth.getBalance(beneficiary);
        let difference = newBalance - initAmount;
        expect(difference).to.equal(ONE_ETH_NUMBER);

        let fundingState = await contract.state.call()
        expect(fundingState.valueOf()).to.deep.equal(PAID_OUT_STATE);
    });

    it('withdraw funds from the contract', async function() {
        await contract.contribute({value: ONE_ETH_NUMBER - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        await contract.withdraw({from: contractCreator});
        let amount = await contract.amounts.call(contractCreator);
        expect(amount).to.deep.equal(web3.utils.toBN(0));
    });

    it('event is emmitted', async function() {
    	// let watcher = await contract.CampaignFinished();
    	await contract.setCurrentTime(601);
    	await contract.finishCrowdFunding();

    	let events = await contract.getPastEvents(contract.CampaignFinished());
    	let event = events[0];
    	expect(event.args.totalCollected.toNumber()).to.equal(0);
    	expect(event.args.succeeded).to.equal(false);
    });
});