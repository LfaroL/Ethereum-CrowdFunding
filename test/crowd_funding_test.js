let CrowdFunding = artifacts.require('./CrowdFunding');

contract('CrowdFunding', function(accounts) {

	let contract;
	let contractCreator = accounts[0];
	let beneficiary = accounts[1];

	const ONE_ETH = web3.utils.toBN(1000000000000000000);

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
});