let CrowdFunding = artifacts.require("./CrowdFunding.sol");

module.exports = async function(deployer) {
	await deployer.deploy(
		CrowdFunding,
		'Test Funding',
		2,
		20,
		"0xF62f425C04AA3539Afeb9B8bD8e8A63831CF7E1a",);
}